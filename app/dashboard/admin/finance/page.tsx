"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Payout {
  id: string;
  amount: number;
  grossAmount: number;
  commission: number;
  netAmount: number;
  status: string;
  method: string;
  createdAt: string;
  vendor: {
    id: string;
    businessName: string;
    bankName: string | null;
    bankAccount: string | null;
    bankRouting: string | null;
    user: {
      name: string | null;
      email: string;
    };
  };
}

interface EscrowTransaction {
  id: string;
  amount: number;
  status: string;
  type: string;
  createdAt: Date;
  order: {
    id: string;
    product: {
      name: string;
    };
    user: {
      name: string | null;
      email: string;
    };
    vendor: {
      businessName: string;
    };
  };
}

export default function AdminFinancePage() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("escrow");
  const [stats, setStats] = useState({
    totalInEscrow: 0,
    totalReleased: 0,
    pendingReleases: 0,
    pendingPayouts: 0
  });

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (session?.user?.role !== "ADMIN") {
      redirect("/dashboard/customer");
    }

    fetchData();
  }, [status, session]);

  const fetchData = async () => {
    try {
      const [financeRes, payoutsRes] = await Promise.all([
        fetch(`/api/admin/finance`),
        fetch(`/api/admin/payouts`)
      ]);
      
      const financeData = await financeRes.json();
      const payoutsData = await payoutsRes.json();
      
      setTransactions(financeData.transactions || []);
      setStats(financeData.stats || { totalInEscrow: 0, totalReleased: 0, pendingReleases: 0, pendingPayouts: 0 });
      setPayouts(payoutsData.payouts || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutAction = async (payoutId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update payout");
      }
    } catch (error) {
      console.error("Error updating payout:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Escrow Management</h2>
          <p className="text-gray-500 text-sm">Monitor platform financial transactions and vendor payouts</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600">account_balance</span>
            </div>
            <span className="text-xs text-gray-500">In Escrow</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">₹{stats.totalInEscrow.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
            </div>
            <span className="text-xs text-gray-500">Released to Vendors</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">₹{stats.totalReleased.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">pending_actions</span>
            </div>
            <span className="text-xs text-gray-500">Pending Release</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">₹{stats.pendingReleases.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600">payments</span>
            </div>
            <span className="text-xs text-gray-500">Pending Payouts</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">₹{payouts.filter(p => p.status === "PENDING").reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("escrow")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "escrow"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Escrow Transactions
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "payouts"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Vendor Payouts
            {payouts.filter(p => p.status === "PENDING").length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                {payouts.filter(p => p.status === "PENDING").length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Escrow Tab */}
      {activeTab === "escrow" && (
        <>
          {/* Escrow Status Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600">info</span>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">How Escrow Works</h4>
                <p className="text-sm text-gray-600 mt-1">
                  When a customer rents a product, payment is held in escrow. It is released to the vendor after the rental period ends successfully, or held until disputes are resolved.
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-gray-900">Escrow Transactions</h3>
            </div>
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No escrow transactions found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase text-gray-500 font-bold">
                    <tr>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Order</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Vendor</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          #{tx.id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{tx.order.product.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div>{tx.order.user.name || "N/A"}</div>
                          <div className="text-xs text-gray-500">{tx.order.user.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{tx.order.vendor.businessName}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{tx.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${tx.type === "ESCROW_HOLD" ? "bg-yellow-100 text-yellow-600" :
                              "bg-green-100 text-green-600"
                            }`}>
                            {tx.type === "ESCROW_HOLD" ? "Hold" : "Release"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${tx.status === "COMPLETED" ? "bg-green-100 text-green-600" :
                              tx.status === "PENDING" ? "bg-yellow-100 text-yellow-600" :
                                "bg-red-100 text-red-600"
                            }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-gray-900">Vendor Payout Requests</h3>
            <p className="text-sm text-gray-500">Review and process vendor withdrawal requests</p>
          </div>
          {payouts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No payout requests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-6 py-4">Payout ID</th>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Bank Details</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Commission</th>
                    <th className="px-6 py-4">Net Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{payout.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="font-medium">{payout.vendor.businessName}</div>
                        <div className="text-xs text-gray-500">{payout.vendor.user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {payout.vendor.bankName ? (
                          <div>
                            <div className="font-medium">{payout.vendor.bankName}</div>
                            <div className="text-xs text-gray-500">
                              A/C: ****{payout.vendor.bankAccount?.slice(-4)}
                            </div>
                            <div className="text-xs text-gray-500">
                              IFSC: {payout.vendor.bankRouting}
                            </div>
                          </div>
                        ) : (
                          <span className="text-red-500 text-xs">No bank details</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        ₹{Number(payout.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        ₹{Number(payout.commission).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        ₹{Number(payout.netAmount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                          payout.status === "COMPLETED" ? "bg-green-100 text-green-600" :
                          payout.status === "PENDING" ? "bg-yellow-100 text-yellow-600" :
                          payout.status === "PROCESSING" ? "bg-blue-100 text-blue-600" :
                          "bg-red-100 text-red-600"
                        }`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(payout.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {payout.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePayoutAction(payout.id, "approve")}
                              className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handlePayoutAction(payout.id, "reject")}
                              className="px-3 py-1.5 bg-red-100 text-red-600 text-xs rounded-lg hover:bg-red-200 transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {payout.status === "COMPLETED" && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Processed
                          </span>
                        )}
                        {payout.status === "REJECTED" && (
                          <span className="text-xs text-red-600">Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

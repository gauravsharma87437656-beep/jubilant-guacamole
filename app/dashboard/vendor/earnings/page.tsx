"use client";

import { useState, useEffect } from "react";
import { IndianRupee, Wallet, TrendingUp, DollarSign, Clock, AlertCircle, Building2 } from "lucide-react";
import Link from "next/link";

interface Payout {
  id: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  processedAt: string | null;
}

interface BankDetails {
  bankName: string | null;
  bankAccount: string | null;
  bankRouting: string | null;
  paypalEmail: string | null;
}

interface EarningsData {
  totalEarnings: number;
  totalPaidOut: number;
  pendingBalance: number;
  pendingPayoutAmount: number;
  activeRentals: number;
  totalSales: number;
  rating: number;
  payouts: Payout[];
  bankDetails?: BankDetails;
}

export default function VendorEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [showBankRequiredModal, setShowBankRequiredModal] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vendor/earnings");
      const data = await res.json();
      if (res.ok) {
        setData(data);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawClick = () => {
    // Check if bank details are added
    if (!data?.bankDetails?.bankName || !data?.bankDetails?.bankAccount) {
      setShowBankRequiredModal(true);
      return;
    }
    setShowWithdrawModal(true);
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    
    // Validate amount
    if (!withdrawAmount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // Check for insufficient funds
    if (amount > (data?.pendingBalance || 0)) {
      setShowWithdrawModal(false);
      setShowInsufficientModal(true);
      return;
    }

    // Minimum withdrawal amount (₹100)
    if (amount < 100) {
      setError("Minimum withdrawal amount is ₹100");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/vendor/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount }),
      });
      
      const responseData = await res.json();
      
      if (res.ok) {
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        fetchEarnings();
      } else {
        setError(responseData.error || "Failed to process request");
      }
    } catch (error) {
      console.error("Error requesting payout:", error);
      setError("Failed to process request. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600">Track your earnings and manage payouts</p>
        </div>
        <button
          onClick={handleWithdrawClick}
          className="px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition font-medium shadow-md flex items-center gap-2"
        >
          <IndianRupee className="w-4 h-4" />
          Request Payout
        </button>
      </div>

      {/* Bank Details Warning */}
      {(!data?.bankDetails?.bankName || !data?.bankDetails?.bankAccount) && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800">Bank Account Required</h3>
            <p className="text-sm text-amber-700 mt-1">
              Please add your bank account details to request payouts.
            </p>
            <Link
              href="/dashboard/vendor/settings"
              className="inline-block mt-3 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition"
            >
              Add Bank Details
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{data?.totalEarnings?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{data?.pendingBalance?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.totalSales || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Rating</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.rating?.toFixed(1) || "0.0"}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-50 text-purple-600">
              <span className="material-symbols-outlined text-2xl">star</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details Card */}
      {data?.bankDetails?.bankName && data?.bankDetails?.bankAccount && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Payout Bank Account</p>
                <p className="font-semibold text-gray-900">{data.bankDetails.bankName}</p>
                <p className="text-sm text-gray-600">
                  Account: ****{data.bankDetails.bankAccount.slice(-4)}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/vendor/settings"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </Link>
          </div>
        </div>
      )}

      {/* Payouts History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Payout History</h2>
        </div>
        {data?.payouts && data.payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payout ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{payout.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{Number(payout.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payout.method === "BANK_TRANSFER" ? "Bank Transfer" : payout.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(
                          payout.status
                        )}`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payout.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No payouts yet
            </h3>
            <p className="mt-1 text-gray-500">
              Your payout history will appear here once you request a withdrawal.
            </p>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Request Payout</h3>
              <p className="text-sm text-gray-500 mt-1">Enter the amount you wish to withdraw to your bank account.</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value);
                      setError("");
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 placeholder:text-gray-400 text-lg font-semibold bg-gray-50"
                    placeholder="0.00"
                    min="100"
                  />
                </div>
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-gray-600">Available Balance:</span>
                  <span className="font-bold text-green-600">₹{data?.pendingBalance?.toLocaleString() || 0}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum withdrawal: ₹100</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setError("");
                  setWithdrawAmount("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={processing}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition font-semibold shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? "Processing..." : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Funds Modal */}
      {showInsufficientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Insufficient Balance</h3>
              <p className="text-sm text-gray-500 mt-2">
                You don't have enough balance to withdraw ₹{Number(withdrawAmount).toLocaleString()}. 
                Your available balance is ₹{data?.pendingBalance?.toLocaleString() || 0}.
              </p>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => {
                  setShowInsufficientModal(false);
                  setWithdrawAmount("");
                }}
                className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-semibold"
              >
                OK, Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Required Modal */}
      {showBankRequiredModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Bank Account Required</h3>
              <p className="text-sm text-gray-500 mt-2">
                Please add your bank account details before requesting a payout. This is required for transferring funds to your account.
              </p>
            </div>
            <div className="p-6 pt-0 space-y-3">
              <Link
                href="/dashboard/vendor/settings"
                className="block w-full px-4 py-2.5 bg-rose-600 text-white text-center rounded-xl hover:bg-rose-700 transition font-semibold"
              >
                Add Bank Details
              </Link>
              <button
                onClick={() => setShowBankRequiredModal(false)}
                className="w-full px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

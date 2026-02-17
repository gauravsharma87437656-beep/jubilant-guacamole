"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Dispute {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string;
  rental: {
    orderNumber: string;
    totalAmount: number;
    customer: {
      user: {
        name: string;
        email: string;
      }
    }
    vendor: {
      businessName: string;
    }
  };
  createdAt: Date;
}

export default function AdminDisputesPage() {
  const { data: session, status } = useSession();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (session?.user?.role !== "ADMIN") {
      redirect("/dashboard/customer");
    }

    fetchDisputes();
  }, [status, session]);

  const fetchDisputes = async () => {
    try {
      const res = await fetch("/api/admin/disputes");
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
      }
    } catch (error) {
      console.error("Error fetching disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <header className="flex items-center justify-between mb-6 lg:mb-8">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900">All Disputes</h2>
          <p className="text-gray-500 text-sm mt-1">View and manage all rental disputes.</p>
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {disputes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No disputes found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-gray-500 font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Dispute</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">#{dispute.id.slice(-4)}</div>
                      <div className="text-xs text-gray-500 mt-1">{dispute.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-rose-600">{dispute.rental?.orderNumber || "N/A"}</div>
                      <div className="text-xs text-gray-500">₹{dispute.rental?.totalAmount || 0}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {dispute.rental?.customer?.user?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {dispute.rental?.vendor?.businessName || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded uppercase ${dispute.type === "DAMAGE" ? "bg-red-100 text-red-600" :
                          dispute.type === "LATE_RETURN" ? "bg-orange-100 text-orange-600" :
                            "bg-slate-100 text-gray-600"
                        }`}>
                        {dispute.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-gray-600">{dispute.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

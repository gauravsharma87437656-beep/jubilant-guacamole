"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Order {
  id: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  product: {
    name: string;
  };
  vendor: {
    businessName: string;
  };
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (session?.user?.role !== "ADMIN") {
      redirect("/dashboard/customer");
    }

    fetchOrders();
  }, [status, session]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders`);
      const data = await res.json();
      setOrders(data.orders || []);
      setStats(data.stats || { totalRevenue: 0, totalOrders: 0, completedOrders: 0, pendingOrders: 0 });
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
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
          <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
          <p className="text-gray-500 text-sm">Track orders and revenue across the platform</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">payments</span>
            </div>
            <span className="text-xs text-gray-500">Total Revenue</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">receipt_long</span>
            </div>
            <span className="text-xs text-gray-500">Total Orders</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-rose-600">check_circle</span>
            </div>
            <span className="text-xs text-gray-500">Completed</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.completedOrders}</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600">pending</span>
            </div>
            <span className="text-xs text-gray-500">Pending</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
        <div className="h-64 flex items-end justify-around gap-2">
          {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80, 88].map((height, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-full bg-rose-500 rounded-t-lg hover:bg-rose-600 transition-colors"
                style={{ height: `${height}%` }}
              ></div>
              <span className="text-[10px] text-gray-500">{(i + 1).toString().padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-gray-500 font-bold">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{order.user.name || "N/A"}</div>
                      <div className="text-xs text-gray-500">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{order.vendor.businessName}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${order.status === "COMPLETED" ? "bg-green-100 text-green-600" :
                          order.status === "PENDING" ? "bg-yellow-100 text-yellow-600" :
                            order.status === "CANCELLED" ? "bg-red-100 text-red-600" :
                              "bg-blue-100 text-blue-600"
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
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

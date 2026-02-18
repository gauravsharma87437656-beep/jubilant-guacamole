"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UserDetails {
    id: string;
    name: string | null;
    email: string;
    role: string;
    image: string | null;
    createdAt: string;
    customer?: {
        phone: string | null;
        rentals: any[];
    };
    vendor?: {
        businessName: string;
        status: string;
        totalSales: number;
        rating: number;
    };
    addresses: any[];
}

export default function AdminUserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/admin/users/${params.id}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        alert("User not found");
                        router.push("/dashboard/admin/users");
                        return;
                    }
                    throw new Error("Failed to fetch");
                }
                const data = await res.json();
                setUser(data.user);
            } catch (error) {
                console.error("Error fetching user details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchUser();
        }
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="p-4 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin/users">
                    <Button variant="outline" size="sm" className="gap-2">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Users
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                    <p className="text-sm text-gray-500">View and manage user information</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-3xl font-bold text-rose-600">
                                {user.image ? (
                                    <img src={user.image} alt={user.name || "User"} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    (user.name?.[0] || "U").toUpperCase()
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{user.name || "No Name"}</h2>
                            <p className="text-sm text-gray-500 mb-4">{user.email}</p>

                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-6 ${user.role === "ADMIN" ? "bg-rose-100 text-rose-600" :
                                user.role === "VENDOR" ? "bg-purple-100 text-purple-600" :
                                    "bg-blue-100 text-blue-600"
                                }`}>
                                {user.role}
                            </div>

                            <div className="w-full pt-6 border-t border-slate-100 space-y-3 text-left">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">User ID</span>
                                    <span className="font-mono text-xs text-gray-900">{user.id}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Joined</span>
                                    <span className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                                {user.customer?.phone && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Phone</span>
                                        <span className="text-gray-900">{user.customer.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Vendor Specific Info */}
                    {user.role === "VENDOR" && user.vendor && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-600">store</span>
                                Vendor Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Business Name</span>
                                    <span className="text-gray-900 font-medium">{user.vendor.businessName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Status</span>
                                    <span className={`font-medium ${user.vendor.status === 'APPROVED' ? 'text-green-600' :
                                        user.vendor.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-900'
                                        }`}>
                                        {user.vendor.status}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total Sales</span>
                                    <span className="text-gray-900">{user.vendor.totalSales}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Rating</span>
                                    <span className="text-gray-900 flex items-center gap-1">
                                        {Number(user.vendor.rating).toFixed(1)} <span className="text-yellow-400">★</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Details Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Addresses */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Addresses</h3>
                        {user.addresses && user.addresses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.addresses.map((addr: any) => (
                                    <div key={addr.id} className="p-4 border border-slate-100 rounded-lg text-sm">
                                        <div className="font-bold text-gray-900 mb-1">
                                            {addr.firstName} {addr.lastName}
                                            {addr.isDefault && <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Default</span>}
                                        </div>
                                        <div className="text-gray-600">
                                            {addr.address1} {addr.address2}<br />
                                            {addr.city}, {addr.state} {addr.postalCode}<br />
                                            {addr.country}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No addresses saved.</p>
                        )}
                    </div>

                    {/* Rental History (for Customers) */}
                    {user.customer && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Recent Rentals</h3>
                            {user.customer.rentals && user.customer.rentals.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-xs uppercase text-gray-500">
                                            <tr>
                                                <th className="px-4 py-3">Order #</th>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {user.customer.rentals.map((rental: any) => (
                                                <tr key={rental.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{rental.orderNumber}</td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {new Date(rental.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${rental.status === 'COMPLETED' || rental.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
                                                            rental.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                                                'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            {rental.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                                        ₹{Number(rental.totalAmount).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No rental history.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { VendorSidebar } from "@/components/dashboard/vendor-sidebar";

export default function VendorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <VendorSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header for Sidebar Toggle */}
                <div className="lg:hidden p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                    <span className="font-bold text-gray-900">RentSquire Vendor</span>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

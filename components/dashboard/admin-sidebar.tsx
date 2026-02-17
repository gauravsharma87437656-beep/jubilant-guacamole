"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export function AdminSidebar({
    open,
    setOpen
}: {
    open?: boolean;
    setOpen?: (open: boolean) => void;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className={cn(
            "fixed lg:relative z-50 lg:z-0 w-64 h-screen bg-slate-950 border-r border-slate-800 flex flex-col transform transition-transform duration-300",
            open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
            <div className="p-6 flex items-center gap-3">
                <div className="size-10 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">hotel</span>
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-none text-white">Rent Square</h1>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Admin Panel</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
                <NavItem href="/dashboard/admin" icon="dashboard" label="Dashboard" active={isActive("/dashboard/admin")} onClick={() => setOpen?.(false)} />
                <NavItem href="/dashboard/admin/users" icon="group" label="User Management" active={isActive("/dashboard/admin/users")} onClick={() => setOpen?.(false)} />
                <NavItem href="/dashboard/admin/vendors" icon="verified_user" label="KYC Approvals" active={isActive("/dashboard/admin/vendors")} onClick={() => setOpen?.(false)} />
                <NavItem href="/dashboard/admin/disputes" icon="gavel" label="Disputes" active={isActive("/dashboard/admin/disputes")} onClick={() => setOpen?.(false)} />
                <NavItem href="/dashboard/admin/finance" icon="account_balance_wallet" label="Escrow Management" active={isActive("/dashboard/admin/finance")} onClick={() => setOpen?.(false)} />
                <NavItem href="/dashboard/admin/orders" icon="analytics" label="Revenue Analytics" active={isActive("/dashboard/admin/orders")} onClick={() => setOpen?.(false)} />
                <NavItem href="/dashboard/admin/brands" icon="workspace_premium" label="Brands" active={isActive("/dashboard/admin/brands")} onClick={() => setOpen?.(false)} />
                <NavItem href="/dashboard/admin/categories" icon="category" label="Categories" active={isActive("/dashboard/admin/categories")} onClick={() => setOpen?.(false)} />
                <NavItem href="/dashboard/admin/banners" icon="imagesmode" label="Hero Banners" active={isActive("/dashboard/admin/banners")} onClick={() => setOpen?.(false)} />
                <NavItem href="/dashboard/admin/drops" icon="auto_awesome" label="Drops Section" active={isActive("/dashboard/admin/drops")} onClick={() => setOpen?.(false)} />

                <div className="pt-4 pb-2">
                    <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">System</p>
                </div>

                <NavItem href="/dashboard/admin/settings" icon="settings" label="Settings" active={isActive("/dashboard/admin/settings")} onClick={() => setOpen?.(false)} />
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-900/50 p-3 rounded-xl mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800">
                            {session?.user?.image ? (
                                <img className="w-full h-full object-cover" src={session.user.image} alt="Admin" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-rose-600 text-white font-bold text-xs">
                                    {session?.user?.name?.[0] || "A"}
                                </div>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{session?.user?.name || "Admin"}</p>
                            <p className="text-[10px] text-slate-400 truncate">{session?.user?.email}</p>
                        </div>
                    </div>
                </div>

                <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg w-full transition-colors">
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}

function NavItem({ href, icon, label, active, onClick }: { href: string; icon: string; label: string; active?: boolean; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                active
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
        >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="text-sm">{label}</span>
        </Link>
    );
}

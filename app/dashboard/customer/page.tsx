"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, Clock, CreditCard, User, Star, Menu, X, Home, LogOut, MapPin, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";

interface RentalStats {
  active: number;
  upcoming: number;
  pending: number;
  total: number;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<RentalStats>({ active: 0, upcoming: 0, pending: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Redirect vendors to vendor dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "VENDOR") {
      router.push("/dashboard/vendor");
    }
  }, [status, session, router]);

  // Fetch rental stats
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/rentals")
        .then((res) => res.json())
        .then((data) => {
          if (data.stats) {
            setStats(data.stats);
          }
        })
        .catch((err) => console.error("Failed to fetch stats:", err))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const menuItems = [
    {
      title: "My Rentals",
      description: "View and manage your active and past rentals",
      icon: Package,
      href: "/dashboard/customer/rentals",
    },
    {
      title: "Upcoming Rentals",
      description: "See your scheduled rentals",
      icon: Clock,
      href: "/dashboard/customer/upcoming",
    },
    {
      title: "Payment Methods",
      description: "Manage your saved payment methods",
      icon: CreditCard,
      href: "/dashboard/customer/payments",
    },
    {
      title: "Profile",
      description: "Update your personal information",
      icon: User,
      href: "/dashboard/customer/profile",
    },
    {
      title: "Reviews",
      description: "Rate and review your rentals",
      icon: Star,
      href: "/dashboard/customer/reviews",
    },
    {
      title: "Addresses",
      description: "Manage your delivery addresses",
      icon: MapPin,
      href: "/dashboard/customer/addresses",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile Responsive like Flipkart */}
      <aside className={`
        fixed lg:relative z-50 lg:z-0
        w-72 h-screen bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">diamond</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none text-gray-900">Rent Culture</h1>
              <p className="text-xs text-gray-800 mt-1">Hello, {session?.user?.name?.split(' ')[0] || 'User'}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link 
            href="/dashboard/customer" 
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-lg font-medium"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:hidden sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-lg">diamond</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Rent Culture</span>
          </Link>
          <div className="w-10"></div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-8 sticky top-0 z-30">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">diamond</span>
            </div>
            <h1 className="font-bold text-xl text-gray-900">Rent Culture</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                {session?.user?.name?.[0] || "U"}
              </div>
              <span className="font-medium text-gray-900">{session?.user?.name || "User"}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Welcome Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Welcome back, {session?.user?.name?.split(' ')[0] || "Customer"}!
            </h1>
            <p className="mt-1 lg:mt-2 text-gray-900">
              Manage your rentals and account settings
            </p>
          </div>

          {/* Quick Stats - Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-800">Active Rentals</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{loading ? "-" : stats.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-800">Upcoming</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{loading ? "-" : stats.upcoming}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-800">Pending</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{loading ? "-" : stats.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 lg:p-3 bg-rose-100 rounded-lg">
                  <CreditCard className="h-5 w-5 lg:h-6 lg:w-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-800">Total Orders</p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">{loading ? "-" : stats.total}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Grid - Flipkart Style */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">My Account</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
              {menuItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 lg:p-6 hover:shadow-md hover:border-primary transition-all group"
                >
                  <div className="flex items-center justify-center mb-3 lg:mb-4">
                    <div className="p-3 bg-gray-100 rounded-full group-hover:bg-primary/10 transition-colors">
                      <item.icon className="h-6 w-6 lg:h-8 lg:w-8 text-gray-600 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-sm lg:text-base font-semibold text-gray-900 text-center">{item.title}</h3>
                  <p className="mt-1 text-xs text-gray-800 text-center hidden lg:block">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}


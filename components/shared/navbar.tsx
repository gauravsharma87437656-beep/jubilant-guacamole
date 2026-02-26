"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, User, Menu, X, LogOut, Search, Layers, ChevronDown, Package, MapPin, Star, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { MobileSearchOverlay } from "@/components/shared/mobile-search-overlay";

const navigation = {
  pages: [
    { name: "Shop All", href: "/shop" },
    { name: "Male", href: "/categories/male" },
    { name: "Female", href: "/categories/female" },
  ],
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);

  const cartItems = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Auto-hide navbar on scroll down (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setNavHidden(true);
      } else {
        setNavHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data.products || []);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Search fetch error", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/categories?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setMobileMenuOpen(false);
      setShowMobileSearch(false);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  const getDashboardLink = () => {
    if (session?.user?.role === "ADMIN") return "/dashboard/admin";
    if (session?.user?.role === "VENDOR") return "/dashboard/vendor";
    return "/dashboard/customer";
  };

  const isMobileHiddenPage = pathname === "/cart" || pathname?.startsWith("/profile");

  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white border-b border-gray-200 transition-transform duration-300",
      isMobileHiddenPage && "hidden md:block",
      navHidden && "md:translate-y-0 -translate-y-full"
    )}>
      <nav className="w-full px-4 md:px-8 relative">
        <div className="flex h-14 md:h-16 items-center justify-between">

          {/* Left side: Hamburger (mobile) + Logo */}
          <div className="flex items-center gap-2">
            {/* Hamburger - Left side on Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-gray-900 md:hidden -ml-1"
            >
              <span className="sr-only">Menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5">
              <Layers className="h-5 w-5 md:h-6 md:w-6 text-black" />
              <span className="text-lg md:text-2xl font-bold text-gray-900">Rentsquire</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.pages.map((page) => (
              <Link
                key={page.name}
                href={page.href}
                prefetch={false}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-gray-900",
                  pathname === page.href
                    ? "text-gray-900"
                    : "text-black"
                )}
              >
                {page.name}
              </Link>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-1 md:space-x-4 ml-auto md:ml-0">

            {/* Desktop Search Bar */}
            <div className="relative hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  placeholder="Search products..."
                  className="pl-4 pr-10 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-black text-gray-900 placeholder-gray-500 transition-all w-80 lg:w-[450px]"
                />
                <button type="submit" className="absolute right-2 text-gray-400 hover:text-black">
                  <Search className="h-4 w-4" />
                </button>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-md border border-gray-200 mt-1 z-50 max-h-96 overflow-y-auto">
                  {suggestions.map(product => (
                    <Link
                      href={`/product/${product.id}`}
                      key={product.id}
                      prefetch={false}
                      className="block px-4 py-2 hover:bg-gray-50 flex gap-3 items-center border-b border-gray-100 last:border-0"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {product.images && product.images[0] && (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate">{product.brand?.name || product.category?.name}</p>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={(e) => handleSearch(e)}
                    className="w-full text-center py-2 text-xs font-semibold text-primary hover:bg-gray-50 uppercase tracking-wider"
                  >
                    View All Results
                  </button>
                </div>
              )}
            </div>

            {/* Cart Icon - Mobile: simple, Desktop: with count badge */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-900 hover:text-gray-700 cursor-pointer"
            >
              <span className="sr-only">Cart</span>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] md:text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile / Sign In - Desktop Only */}
            {status === "loading" ? (
              <div className="hidden md:block h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <div
                className="relative hidden md:block group"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-black hover:text-gray-900 cursor-pointer py-1"
                >
                  <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-rose-600" />
                  </div>
                  <span className="hidden lg:flex items-center gap-1">
                    {session.user?.name || "Profile"}
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] ring-1 ring-black/5 z-50 overflow-hidden transform opacity-100 transition-all duration-200">
                    <div className="p-4 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 mb-1">Your Account</p>
                    </div>
                    <div className="py-2">
                      {session?.user?.role !== "USER" && (
                        <Link
                          href={getDashboardLink()}
                          prefetch={false}
                          className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 hover:text-rose-600 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Layers className="h-[18px] w-[18px]" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        prefetch={false}
                        className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 hover:text-rose-600 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-[18px] w-[18px]" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/profile/orders"
                        prefetch={false}
                        className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 hover:text-rose-600 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Package className="h-[18px] w-[18px]" />
                        <span>Orders</span>
                      </Link>
                      <Link
                        href="/profile/addresses"
                        prefetch={false}
                        className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 hover:text-rose-600 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <MapPin className="h-[18px] w-[18px]" />
                        <span>Saved Addresses</span>
                      </Link>
                      <Link
                        href="/profile/reviews"
                        prefetch={false}
                        className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 hover:text-rose-600 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Star className="h-[18px] w-[18px]" />
                        <span>Reviews</span>
                      </Link>
                      <Link
                        href="/profile/settings"
                        prefetch={false}
                        className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 hover:text-rose-600 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-[18px] w-[18px]" />
                        <span>Settings</span>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 hover:text-rose-600 transition-colors text-left"
                      >
                        <LogOut className="h-[18px] w-[18px]" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login" prefetch={false}>
                  <Button
                    size="sm"
                    className="bg-black text-white hover:bg-gray-900 hover:text-white hover:font-bold transition-all"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Overlay (Full Screen) */}
        <MobileSearchOverlay
          isOpen={showMobileSearch}
          onClose={() => setShowMobileSearch(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          suggestions={suggestions}
          handleSearch={handleSearch}
        />

        {/* Mobile Menu - Left Side Drawer */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="md:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl animate-slide-in-left overflow-y-auto">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-1.5" onClick={() => setMobileMenuOpen(false)}>
                  <Layers className="h-5 w-5 text-black" />
                  <span className="text-lg font-bold text-gray-900">Rentsquire</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Info */}
              {session && (
                <div className="px-4 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-gray-900">{session.user?.name || "User"}</p>
                      <p className="text-[12px] text-gray-400">{session.user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Links */}
              <div className="py-3">
                <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Shop</p>
                {navigation.pages.map((page) => (
                  <Link
                    key={page.name}
                    href={page.href}
                    prefetch={false}
                    className="flex items-center px-4 py-3 text-[15px] font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {page.name}
                  </Link>
                ))}
              </div>

              {session && (
                <div className="py-3 border-t border-gray-100">
                  <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Account</p>
                  {session?.user?.role !== "USER" && (
                    <Link
                      href={getDashboardLink()}
                      prefetch={false}
                      className="flex items-center gap-3 px-4 py-3 text-[15px] text-gray-800 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Layers className="h-5 w-5 text-gray-400" />
                      Dashboard
                    </Link>
                  )}
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-[15px] text-gray-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-5 w-5 text-gray-400" />
                    My Profile
                  </Link>
                  <Link href="/profile/orders" className="flex items-center gap-3 px-4 py-3 text-[15px] text-gray-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                    <Package className="h-5 w-5 text-gray-400" />
                    Orders
                  </Link>
                  <Link href="/profile/addresses" className="flex items-center gap-3 px-4 py-3 text-[15px] text-gray-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                    <MapPin className="h-5 w-5 text-gray-400" />
                    Addresses
                  </Link>
                  <Link href="/profile/settings" className="flex items-center gap-3 px-4 py-3 text-[15px] text-gray-800 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                    <Settings className="h-5 w-5 text-gray-400" />
                    Settings
                  </Link>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="py-3 border-t border-gray-100 px-4">
                {session ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-semibold text-[14px] border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                ) : (
                  <Link href="/login" prefetch={false} onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gray-900 text-white hover:bg-black h-12 rounded-xl font-bold">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}

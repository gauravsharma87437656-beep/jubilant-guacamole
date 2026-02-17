"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, User, Menu, X, LogOut, Search, Layers } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { MobileSearchOverlay } from "@/components/shared/mobile-search-overlay";

const navigation = {
  categories: [
    { name: "Wedding", href: "/categories/wedding" },
    { name: "Party", href: "/categories/party" },
    { name: "Casual", href: "/categories/casual" },
    { name: "Formal", href: "/categories/formal" },
  ],
  pages: [
    { name: "How it works", href: "/how-it-works" },
  ],
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartItems = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-16 items-center justify-between">

          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            {/* Logo Icon */}
            <Link href="/" className="flex items-center justify-center">
              <Layers className="h-6 w-6 text-black" />
            </Link>

            {/* Brand Text - Near Logo on Mobile & Desktop */}
            <div className="">
              <Link href="/" className="text-xl md:text-2xl font-bold text-gray-900">
                Rent Square
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <div className="relative group">
              <button className="text-sm font-medium text-black hover:text-gray-900">
                Categories
              </button>
              <div className="absolute left-0 top-full mt-1 w-48 rounded-md bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  {navigation.categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      prefetch={false}
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

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
          <div className="flex items-center space-x-2 md:space-x-4 ml-auto md:ml-0">

            {/* Search Icon (Mobile Toggle) */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 text-black hover:text-gray-900 order-1"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Desktop Search Bar */}
            <div className="relative hidden md:block md:order-1" ref={searchRef}>
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

            {/* Cart Icon - Moved before Sign In for Desktop, next to Menu on Mobile */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-black hover:text-gray-900 cursor-pointer order-3 md:order-2"
            >
              <span className="sr-only">Cart</span>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Icon / Sign In Button - Moved to far right on Desktop, before Cart on Mobile */}
            {status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse order-2 md:order-3" />
            ) : session ? (
              <div className="relative order-2 md:order-3">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-black hover:text-gray-900 cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-rose-600" />
                  </div>
                  <span className="hidden lg:inline">{session.user?.name || "Profile"}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        href={getDashboardLink()}
                        prefetch={false}
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/customer/profile"
                        prefetch={false}
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Mobile: User Icon link to login, Desktop: Sign In Button
              <div className="order-2 md:order-3">
                <Link href="/login" className="md:hidden p-2 text-black hover:text-gray-900">
                  <User className="h-5 w-5" />
                </Link>
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
              </div>
            )}

            {/* Mobile menu button (Right) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-black hover:text-gray-900 md:hidden order-4"
            >
              <span className="sr-only">Menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
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

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 absolute bg-white w-full left-0 shadow-xl z-40">
            <div className="space-y-4 px-2 pb-4">

              {/* Categories */}
              <div>
                <span className="text-xs font-semibold text-black uppercase px-2">
                  Categories
                </span>
                {navigation.categories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    prefetch={false}
                    className="block px-3 py-2 text-base font-medium text-black hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              {/* Pages */}
              <div>
                <span className="text-xs font-semibold text-black uppercase px-2">
                  Pages
                </span>
                {navigation.pages.map((page) => (
                  <Link
                    key={page.name}
                    href={page.href}
                    prefetch={false}
                    className="block px-3 py-2 text-base font-medium text-black hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {page.name}
                  </Link>
                ))}
              </div>

              {/* Auth Links/Dashboard in Menu */}
              {session && (
                <div className="pt-2 flex flex-col space-y-2 px-3">
                  <Link href={getDashboardLink()} prefetch={false}>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
              {!session && (
                <div className="pt-2 flex flex-col space-y-2 px-3">
                  <Link href="/login" prefetch={false}>
                    <Button className="w-full bg-black text-white hover:bg-gray-900">Sign In</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

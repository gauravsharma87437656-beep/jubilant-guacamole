"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, User, Menu, X, LogOut, Search } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

const navigation = {
  categories: [
    { name: "Wedding", href: "/categories/wedding" },
    { name: "Party", href: "/categories/party" },
    { name: "Casual", href: "/categories/casual" },
    { name: "Formal", href: "/categories/formal" },
  ],
  pages: [
    { name: "How it works", href: "/how-it-works" },
    { name: "Become a Vendor", href: "/vendor/signup" },
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/categories?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
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
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              RentSquare
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {/* Categories Dropdown */}
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

            {/* Pages */}
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

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search (placeholder) */}
            {/* Search */}
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="relative hidden md:flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="pl-3 pr-10 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-black transition-all w-48 lg:w-64"
                  autoFocus
                  onBlur={() => !searchQuery && setIsSearchOpen(false)}
                />
                <button type="submit" className="absolute right-2 text-gray-400 hover:text-black">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex p-2 text-black hover:text-gray-900 cursor-pointer"
              >
                <span className="sr-only">Search</span>
                <Search className="h-5 w-5" />
              </button>
            )}

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-black hover:text-gray-900 cursor-pointer"
            >
              <span className="sr-only">Cart</span>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {status === "loading" ? (
              <div className="hidden md:flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ) : session ? (
              <div className="relative">
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
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
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

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-black hover:text-gray-900 cursor-pointer"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {/* Categories */}
              <div className="px-2">
                <span className="text-xs font-semibold text-black uppercase">
                  Categories
                </span>
              </div>
              {navigation.categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  prefetch={false}
                  className="block px-3 py-2 text-base font-medium text-black hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}

              {/* Pages */}
              <div className="px-2 pt-4">
                <span className="text-xs font-semibold text-black uppercase">
                  Pages
                </span>
              </div>
              {navigation.pages.map((page) => (
                <Link
                  key={page.name}
                  href={page.href}
                  prefetch={false}
                  className="block px-3 py-2 text-base font-medium text-black hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {page.name}
                </Link>
              ))}

              {/* Auth Links */}
              {session ? (
                <div className="pt-4 flex flex-col space-y-2 px-3">
                  <Link href={getDashboardLink()} prefetch={false}>
                    <Button variant="outline" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="pt-4 flex flex-col space-y-2 px-3">
                  <Link href="/login" prefetch={false}>
                    <Button className="w-full bg-black text-white hover:bg-gray-900 hover:text-white hover:font-bold transition-all">Sign In</Button>
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

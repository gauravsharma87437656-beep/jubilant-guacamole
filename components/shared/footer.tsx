"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Vendor Onboarding", href: "/vendor/signup" },
    { name: "Contact Us", href: "/contact" },
  ],
  support: [
    { name: "FAQs", href: "/faq" },
    { name: "Privacy Policy", href: "/legal/privacy" },
    { name: "Refund & Delivery Policy", href: "/legal/refund" },
    { name: "Terms & Conditions", href: "/legal/terms-conditions" },
    { name: "Partner Terms", href: "/legal/partner-terms" },
  ],
  categories: [
    { name: "Wedding", href: "/categories/wedding" },
    { name: "Party", href: "/categories/party" },
    { name: "Casual", href: "/categories/casual" },
    { name: "Formal", href: "/categories/formal" },
  ],
};

export function Footer() {
  const pathname = usePathname();
  const isMobileHiddenPage = pathname === "/cart" || pathname?.startsWith("/profile") || pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";

  return (
    <footer className={cn("bg-[#FAFAFA] border-t border-gray-100 text-gray-600", isMobileHiddenPage && "hidden md:block")}>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12">
          {/* Brand & Description */}
          <div className="flex flex-col gap-6">
            <Link href="/" prefetch={false} className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-gray-200">
                <span className="material-symbols-outlined text-xl">layers</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-gray-900">Rentsquire</span>
            </Link>
            <p className="text-base leading-relaxed text-gray-500 max-w-xs">
              Affordable fashion for every occasion
            </p>
          </div>

          {/* Categories */}
          <div className="lg:pl-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">
              Shop Categories
            </h3>
            <ul className="space-y-4">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-[15px] text-gray-500 hover:text-black transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">
              Company
            </h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-[15px] text-gray-500 hover:text-black transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Support */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">
              Support & Legal
            </h3>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-[15px] text-gray-500 hover:text-black transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Rentsquire. Built by Paliwal Global Enterprise.
            </p>
          </div>

          {/* Features */}
          <div className="flex items-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2 group cursor-help">
              <span className="material-symbols-outlined text-green-500 text-lg group-hover:scale-110 transition-transform">verified_user</span>
              <span className="text-xs font-bold text-gray-600 tracking-tight">SECURE</span>
            </div>
            <div className="flex items-center gap-2 group cursor-help">
              <span className="material-symbols-outlined text-blue-500 text-lg group-hover:scale-110 transition-transform">support_agent</span>
              <span className="text-xs font-bold text-gray-600 tracking-tight">SUPPORT</span>
            </div>
            <div className="flex items-center gap-2 group cursor-help">
              <span className="material-symbols-outlined text-purple-500 text-lg group-hover:scale-110 transition-transform">check_circle</span>
              <span className="text-xs font-bold text-gray-600 tracking-tight">HYGIENE</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

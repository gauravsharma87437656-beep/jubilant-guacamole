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
              <span className="text-2xl font-black tracking-tight text-gray-900">Rent Square</span>
            </Link>
            <p className="text-base leading-relaxed text-gray-500 max-w-xs">
              India&apos;s premium fashion rental marketplace. Wear designer outfits for every occasion without the high cost.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-black hover:border-black transition-all">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 014.42 4.075c.636-.247 1.363-.416 2.427-.465C7.901 2.013 8.242 2 12.315 2zm-2.008 2H8.396c-2.347 0-3.522 1.176-3.522 3.522v1.911c0 2.347 1.175 3.522 3.522 3.522h1.911c2.347 0 3.522-1.175 3.522-3.522V7.522C13.829 5.175 12.654 4 10.307 4zM10.307 14.939c-2.761 0-5 2.238-5 5s2.239 5 5 5 5-2.238 5-5-2.239-5-5-5zm0 2c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm6.65-8.477c0 .736-.597 1.333-1.333 1.333-.735 0-1.333-.597-1.333-1.333 0-.735.597-1.333 1.333-1.333.736 0 1.333.597 1.333 1.333z" /></svg>
              </Link>
            </div>
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
              &copy; {new Date().getFullYear()} Rent Square. Built by Paliwal Global Enterprise.
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

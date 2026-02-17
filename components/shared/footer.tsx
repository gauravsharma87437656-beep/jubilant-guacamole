import Link from "next/link";

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "How Rental Works", href: "/how-it-works" },
    { name: "Vendor Onboarding", href: "/vendor/signup" },
    { name: "Contact Us", href: "/contact" },
  ],
  support: [
    { name: "FAQs", href: "/faqs" },
    { name: "Pricing & Deposits", href: "/pricing" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund & Return Policy", href: "/refund-policy" },
  ],
  categories: [
    { name: "Wedding", href: "/categories/wedding" },
    { name: "Party", href: "/categories/party" },
    { name: "Casual", href: "/categories/casual" },
    { name: "Formal", href: "/categories/formal" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-600">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" prefetch={false} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-lg">layers</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Rent Square</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-600">
              India's premium fashion rental marketplace. Authentic designer wear, verified quality, and secure transactions.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    prefetch={false}
                    className="text-sm hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              &copy; {new Date().getFullYear()} Rent Square. All rights reserved.
            </p>

            {/* Trust Badges */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2" title="Secure Payment">
                <span className="material-symbols-outlined text-green-600 text-xl">lock</span>
                <span className="text-xs font-bold text-gray-700 hidden sm:inline">Secure</span>
              </div>
              <div className="flex items-center gap-2" title="24/7 Support">
                <span className="material-symbols-outlined text-blue-600 text-xl">support_agent</span>
                <span className="text-xs font-bold text-gray-700 hidden sm:inline">Support</span>
              </div>
              <div className="flex items-center gap-2" title="Hygiene Verified">
                <span className="material-symbols-outlined text-purple-600 text-xl">clean_hands</span>
                <span className="text-xs font-bold text-gray-700 hidden sm:inline">Verified</span>
              </div>
            </div>

            {/* Social Links Placeholder */}
            <div className="flex gap-4 md:hidden lg:flex border-l border-gray-200 pl-8">
              <Link href="#" prefetch={false} className="text-gray-400 hover:text-primary transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 014.42 4.075c.636-.247 1.363-.416 2.427-.465C7.901 2.013 8.242 2 12.315 2zm-2.008 2H8.396c-2.347 0-3.522 1.176-3.522 3.522v1.911c0 2.347 1.175 3.522 3.522 3.522h1.911c2.347 0 3.522-1.175 3.522-3.522V7.522C13.829 5.175 12.654 4 10.307 4zM10.307 14.939c-2.761 0-5 2.238-5 5s2.239 5 5 5 5-2.238 5-5-2.239-5-5-5zm0 2c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm6.65-8.477c0 .736-.597 1.333-1.333 1.333-.735 0-1.333-.597-1.333-1.333 0-.735.597-1.333 1.333-1.333.736 0 1.333.597 1.333 1.333z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

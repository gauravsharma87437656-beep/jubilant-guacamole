import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Providers } from "@/components/providers";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "RentSquire - Rent Fashion for Any Occasion",
    template: "%s | RentSquire",
  },
  description: "Rent designer dresses, shoes, and accessories for weddings, parties, and special events. Save money with our rental service.",
  keywords: ["fashion rental", "dress rental", "wedding dress", "party dress", "designer rental"],
  authors: [{ name: "RentSquire" }],
  creator: "RentSquire",
  publisher: "RentSquire",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'RentSquire',
    title: 'RentSquire - Rent Fashion for Any Occasion',
    description: 'Rent designer dresses, shoes, and accessories for weddings, parties, and special events.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentSquire - Rent Fashion for Any Occasion',
    description: 'Rent designer dresses, shoes, and accessories for weddings, parties, and special events.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL@20..48,100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <Providers>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md z-[100]">
            Skip to main content
          </a>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main id="main-content" className="flex-1" role="main">{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <CookieConsent />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

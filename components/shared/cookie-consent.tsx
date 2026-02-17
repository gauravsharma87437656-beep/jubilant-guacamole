"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const COOKIE_CONSENT_KEY = "rent-square-cookie-consent";

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${COOKIE_CONSENT_KEY}=`));
    
    if (!consent) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setShowConsent(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const setCookie = (value: string, days: number) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const cookieString = `${COOKIE_CONSENT_KEY}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${process.env.NODE_ENV === 'production' ? ';Secure' : ''}`;
    document.cookie = cookieString;
  };

  const handleAccept = () => {
    setCookie("accepted", 365);
    setShowConsent(false);
  };

  const handleDecline = () => {
    setCookie("declined", 365);
    setShowConsent(false);
  };

  const handleClose = () => {
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 text-white rounded-lg shadow-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 pr-4">
            <h3 id="cookie-title" className="font-semibold text-lg mb-1">Cookie Preferences</h3>
            <p id="cookie-description" className="text-sm text-gray-300">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              aria-label="Decline cookies"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-white text-gray-900 hover:bg-gray-100"
              aria-label="Accept all cookies"
            >
              Accept All
            </Button>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-white md:hidden"
              aria-label="Close cookie banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

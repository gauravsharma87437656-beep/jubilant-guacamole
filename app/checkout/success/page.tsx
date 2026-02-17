"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";

export default function CheckoutSuccessPage() {
  const { clearCart, clearOnLogout } = useCartStore();

  useEffect(() => {
    // Clear cart after successful purchase
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. You will receive a confirmation email shortly with your order details.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Package className="h-5 w-5" />
              <span>Your items will be delivered soon</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard/customer/rentals">
              <Button className="w-full bg-rose-600 hover:bg-rose-700">
                View My Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Need help?{" "}
          <Link href="#" className="text-rose-600 hover:text-rose-700">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

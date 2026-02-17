"use client";

import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Trash2, ShoppingBag, ArrowRight, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function CartDrawer() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    items,
    wishlist,
    isOpen,
    setCartOpen,
    removeItem,
    updateQuantity,
    getTotalDeposit,
    moveToWishlist,
    moveToCart,
    removeFromWishlist,
  } = useCartStore();

  const totalDeposit = getTotalDeposit();
  const subtotal = items.reduce((sum, item) => sum + item.dailyPrice * item.quantity, 0);

  const handleCheckout = () => {
    setCartOpen(false);
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    router.push("/checkout");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({items.length})
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <Link href="/categories" onClick={() => setCartOpen(false)}>
                <Button className="mt-4">Browse Collection</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                  <Link
                    href={`/product/${item.productId}`}
                    onClick={() => setCartOpen(false)}
                    className="flex-shrink-0"
                  >
                    <div className="w-20 h-24 bg-gray-200 rounded-md overflow-hidden">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <Link
                        href={`/product/${item.productId}`}
                        onClick={() => setCartOpen(false)}
                      >
                        <h3 className="text-sm font-medium text-gray-900 truncate hover:text-rose-600">
                          {item.productName}
                        </h3>
                      </Link>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Size: {item.variantSize || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₹{item.dailyPrice}/day
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              Math.max(1, item.quantity - 1),
                              item.variantId
                            )
                          }
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-sm">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, item.variantId)
                          }
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{(item.dailyPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    {/* Save for Later */}
                    <button
                      onClick={() => moveToWishlist(item.productId, item.variantId)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-rose-600 mt-2"
                    >
                      <Heart className="h-3 w-3" />
                      Save for Later
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Wishlist Items */}
          {wishlist.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-600" />
                Saved for Later ({wishlist.length})
              </h3>
              <div className="space-y-3">
                {wishlist.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-rose-50 rounded-lg p-3">
                    <div className="w-16 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500">₹{item.dailyPrice}/day</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => moveToCart(item.productId, item.variantId)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                        >
                          Move to Cart
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => removeFromWishlist(item.productId, item.variantId)}
                          className="text-xs text-gray-500 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Deposit</span>
                <span>₹{totalDeposit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>₹{(subtotal + totalDeposit).toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full bg-rose-600 hover:bg-rose-700"
              size="lg"
              onClick={handleCheckout}
            >
              {status === "unauthenticated" ? "Sign In to Checkout" : "Proceed to Checkout"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Link
              href="/categories"
              onClick={() => setCartOpen(false)}
              className="block text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

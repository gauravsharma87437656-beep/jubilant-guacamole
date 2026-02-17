"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, ArrowRight, Heart, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    items,
    wishlist,
    removeItem,
    getTotalDeposit,
    getTotalRentals,
    clearCart,
    moveToWishlist,
    moveToCart,
    removeFromWishlist,
  } = useCartStore();

  const totalDeposit = getTotalDeposit();
  const rentalCount = getTotalRentals();

  const handleCheckout = () => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    router.push("/checkout");
  };

  if (items.length === 0 && wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/categories">
              <Button className="mt-6">Browse Collection</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/categories" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
                <Link href="/categories">
                  <Button className="mt-4">Browse Collection</Button>
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex gap-4">
                    <Link href={`/product/${item.productId}`} className="flex-shrink-0">
                      <div className="w-24 h-32 bg-gray-200 rounded-md overflow-hidden">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <Link href={`/product/${item.productId}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-rose-600">
                              {item.productName}
                            </h3>
                          </Link>
                          {item.variantSize && (
                            <p className="text-sm text-gray-500">Size: {item.variantSize}</p>
                          )}
                          {item.variantColor && (
                            <p className="text-sm text-gray-500">Color: {item.variantColor}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            {item.rentalStart && item.rentalEnd
                              ? `${new Date(item.rentalStart).toLocaleDateString()} - ${new Date(
                                  item.rentalEnd
                                ).toLocaleDateString()}`
                              : "Select dates"}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-4 flex justify-between items-end">
                        <div>
                          <p className="text-sm text-gray-500">₹{item.dailyPrice}/day</p>
                          <p className="text-xs text-gray-500">Deposit: ₹{item.depositAmount}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{(item.dailyPrice * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">+ ₹{item.depositAmount} deposit</p>
                        </div>
                      </div>
                      {/* Save for Later Button */}
                      <div className="mt-4 pt-4 border-t">
                        <button
                          onClick={() => moveToWishlist(item.productId, item.variantId)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600"
                        >
                          <Heart className="h-4 w-4" />
                          Save for Later
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Wishlist / Saved Items */}
            {wishlist.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-600" />
                  Saved for Later ({wishlist.length})
                </h2>
                <div className="space-y-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-rose-200">
                      <div className="flex gap-4">
                        <Link href={`/product/${item.productId}`} className="flex-shrink-0">
                          <div className="w-20 h-24 bg-gray-200 rounded-md overflow-hidden">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <Link href={`/product/${item.productId}`}>
                                <h3 className="font-semibold text-gray-900 hover:text-rose-600">
                                  {item.productName}
                                </h3>
                              </Link>
                              {item.variantSize && (
                                <p className="text-sm text-gray-500">Size: {item.variantSize}</p>
                              )}
                              <p className="text-sm text-gray-500">₹{item.dailyPrice}/day</p>
                            </div>
                            <button
                              onClick={() => removeFromWishlist(item.productId, item.variantId)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="mt-3 flex gap-3">
                            <Button
                              size="sm"
                              onClick={() => moveToCart(item.productId, item.variantId)}
                              className="bg-rose-600 hover:bg-rose-700"
                            >
                              Move to Cart
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromWishlist(item.productId, item.variantId)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({rentalCount} items)</span>
                  <span>₹{(items.reduce((sum, item) => sum + item.dailyPrice * item.quantity, 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Deposit</span>
                  <span>₹{totalDeposit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{(items.reduce((sum, item) => sum + item.dailyPrice * item.quantity, 0) + totalDeposit).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                * The deposit will be refunded when you return the items in good condition.
              </div>

              <Button
                className="w-full bg-rose-600 hover:bg-rose-700"
                size="lg"
                onClick={handleCheckout}
                disabled={items.length === 0}
              >
                {status === "loading"
                  ? "Loading..."
                  : status === "unauthenticated"
                  ? "Sign In to Checkout"
                  : "Proceed to Checkout"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Link
                href="/categories"
                className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
              >
                Continue Shopping
              </Link>

              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-red-500"
                >
                  Clear Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

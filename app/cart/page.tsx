"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, ArrowRight, Heart, ArrowLeft, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cart";
import { useSession } from "next-auth/react";
import { RentalCalendar } from "@/components/product/rental-calendar";
import { addDays, differenceInDays } from "date-fns";

function CartItemCard({ item }: { item: CartItem }) {
  const { removeItem, moveToWishlist, updateRentalDates, updateQuantity } = useCartStore();
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to calendar when opened
  useEffect(() => {
    if (showCalendar && calendarRef.current) {
      setTimeout(() => {
        calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300); // Wait for transition
    }
  }, [showCalendar]);

  // Calculate rental days from start/end dates
  const rentalDays = item.rentalStart && item.rentalEnd
    ? Math.max(1, differenceInDays(new Date(item.rentalEnd), new Date(item.rentalStart)) + 1)
    : 3;

  const [localRentalDays, setLocalRentalDays] = useState(rentalDays);
  const [localStartDate, setLocalStartDate] = useState<Date | null>(
    item.rentalStart ? new Date(item.rentalStart) : null
  );

  const handleDateSelect = (date: Date) => {
    setLocalStartDate(date);
    const endDate = addDays(date, localRentalDays - 1);
    updateRentalDates(item.productId, date, endDate, item.variantId);

    // Auto-hide calendar after a short delay
    setTimeout(() => {
      setShowCalendar(false);
    }, 1500);
  };

  const handleRentalDaysChange = (days: number) => {
    const newDays = Math.max(1, days);
    setLocalRentalDays(newDays);
    if (localStartDate) {
      const endDate = addDays(localStartDate, newDays - 1);
      updateRentalDates(item.productId, localStartDate, endDate, item.variantId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
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
                <p className="text-sm text-gray-700 font-medium">Size: {item.variantSize}</p>
              )}
              {item.variantColor && (
                <p className="text-sm text-gray-700 font-medium">Color: {item.variantColor}</p>
              )}
              {item.rentalStart && item.rentalEnd && (
                <p className="text-sm text-emerald-700 font-semibold mt-1">
                  📅 {new Date(item.rentalStart).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} → {new Date(item.rentalEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
            </div>
            <button
              onClick={() => removeItem(item.productId, item.variantId)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {/* Change Dates Button */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <CalendarDays className="h-4 w-4" />
            {showCalendar ? "Hide Calendar" : "Change Dates"}
          </button>

          <div className="mt-4 flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-900 font-medium">₹{item.dailyPrice}/day</p>
              <div className="flex items-center border-2 border-gray-300 rounded-md w-fit mt-2">
                <button
                  onClick={() =>
                    updateQuantity(
                      item.productId,
                      Math.max(1, item.quantity - 1),
                      item.variantId
                    )
                  }
                  className="px-2 py-1 text-gray-900 hover:bg-gray-100 font-bold"
                >
                  -
                </button>
                <span className="px-3 py-1 text-sm font-bold border-x-2 border-gray-300 text-gray-900">{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1, item.variantId)
                  }
                  className="px-2 py-1 text-gray-900 hover:bg-gray-100 font-bold"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-700 font-medium mt-1.5">Deposit: ₹{item.depositAmount}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                ₹{(item.dailyPrice * rentalDays * item.quantity).toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 font-medium">+ ₹{item.depositAmount} deposit</p>
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

      {/* Premium Expandable Calendar Section */}
      <div ref={calendarRef} className={`grid transition-all duration-500 ease-in-out overflow-hidden ${showCalendar ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="min-h-0 space-y-5">
          {/* Rental Duration Adjustment (Top of expandable section) */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Rent for how many days?</p>
            <div className="flex items-center border-2 border-gray-200 bg-white rounded-lg w-fit overflow-hidden">
              <button
                onClick={() => handleRentalDaysChange(localRentalDays - 1)}
                className="px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <span className="px-5 py-1.5 font-bold text-gray-900 border-x-2 border-gray-200 min-w-[80px] text-center text-sm">{localRentalDays} days</span>
              <button
                onClick={() => handleRentalDaysChange(localRentalDays + 1)}
                className="px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Dual Date Display (Read-only style with calendar trigger) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Start Date</label>
              <div className="px-4 py-2.5 border-2 border-rose-100 bg-rose-50/30 rounded-lg text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>{localStartDate ? localStartDate.toLocaleDateString("en-IN") : "Select Start"}</span>
                <CalendarDays className="h-4 w-4 text-rose-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">End Date</label>
              <div className="px-4 py-2.5 border-2 border-gray-100 bg-gray-50 rounded-lg text-sm font-bold text-gray-400 flex items-center justify-between">
                <span>{localStartDate ? addDays(localStartDate, localRentalDays - 1).toLocaleDateString("en-IN") : "mm/dd/yyyy"}</span>
                <CalendarDays className="h-4 w-4 text-gray-300" />
              </div>
            </div>
          </div>

          {/* Calendar Picker */}
          <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
            <RentalCalendar
              bookedDates={[]}
              blockedDates={[]}
              selectedDate={localStartDate}
              rentalDays={localRentalDays}
              onDateSelect={handleDateSelect}
            />
          </div>

          {/* Mini Price Summary for this item */}
          <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-700 font-medium">Rental Breakdown</span>
              <span className="font-bold text-emerald-900">{localRentalDays} days × ₹{item.dailyPrice} = ₹{localRentalDays * item.dailyPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { status } = useSession();
  const {
    items,
    wishlist,
    getTotalDeposit,
    getTotalRentals,
    clearCart,
    moveToCart,
    removeFromWishlist,
  } = useCartStore();

  const totalDeposit = getTotalDeposit();
  const rentalCount = getTotalRentals();

  const subtotal = items.reduce((sum, item) => {
    const days = item.rentalStart && item.rentalEnd
      ? Math.max(1, differenceInDays(new Date(item.rentalEnd), new Date(item.rentalStart)) + 1)
      : 0;
    return sum + (item.dailyPrice * days * item.quantity);
  }, 0);

  const platformFee = Math.round(subtotal * 0.05);
  const total = subtotal + totalDeposit + platformFee;

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
          <Link href="/" className="text-gray-500 hover:text-gray-700">
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
                <CartItemCard key={item.id} item={item} />
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

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Subtotal ({rentalCount} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Deposit</span>
                  <span>₹{totalDeposit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Platform Fee (5%)</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-bold">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                * The deposit will be refunded when you return the items in good condition.
              </div>

              <Button
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-14 text-lg"
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

"use client";

import { useCartStore, CartItem } from "@/store/cart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Trash2, ShoppingBag, ArrowRight, Heart, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { differenceInDays, addDays } from "date-fns";
import { useState } from "react";
import { RentalCalendar } from "@/components/product/rental-calendar";

function CartDrawerItem({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity, moveToWishlist, updateRentalDates, setCartOpen } = useCartStore();
  const [showCalendar, setShowCalendar] = useState(false);

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
    <div className="bg-gray-50 rounded-xl p-3 space-y-3">
      <div className="flex gap-3">
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
              <h3 className="text-sm font-bold text-black truncate hover:text-rose-600">
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
          <p className="text-xs text-black font-medium mt-1">
            Size: {item.variantSize || "N/A"}
          </p>
          <p className="text-xs text-gray-700 font-medium">
            ₹{item.dailyPrice}/day
          </p>
          {item.rentalStart && item.rentalEnd && (
            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
              📅 {new Date(item.rentalStart).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} → {new Date(item.rentalEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}

          {/* Change Dates Toggle */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-bold mt-1"
          >
            <CalendarDays className="h-3 w-3" />
            {showCalendar ? "Hide Calendar" : "Change Dates"}
          </button>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center border-2 border-gray-300 rounded-md">
              <button
                onClick={() =>
                  updateQuantity(
                    item.productId,
                    Math.max(1, item.quantity - 1),
                    item.variantId
                  )
                }
                className="px-2 py-0.5 text-gray-900 font-bold hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-2 py-0.5 text-sm font-bold border-x-2 border-gray-300">{item.quantity}</span>
              <button
                onClick={() =>
                  updateQuantity(item.productId, item.quantity + 1, item.variantId)
                }
                className="px-2 py-0.5 text-gray-900 font-bold hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <p className="text-sm font-bold text-black">
              ₹{(item.dailyPrice * rentalDays * item.quantity).toFixed(2)}
            </p>
          </div>
          {/* Save for Later */}
          <button
            onClick={() => moveToWishlist(item.productId, item.variantId)}
            className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-rose-600 mt-2 font-medium"
          >
            <Heart className="h-3 w-3" />
            Save for Later
          </button>
        </div>
      </div>

      {/* Expandable Calendar with Animation */}
      <div className={`grid transition-all duration-500 ease-in-out overflow-hidden ${showCalendar ? 'grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="min-h-0 space-y-3">
          <div>
            <p className="text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Rental Duration</p>
            <div className="flex items-center border-2 border-gray-300 rounded-lg w-fit">
              <button
                onClick={() => handleRentalDaysChange(localRentalDays - 1)}
                className="px-2 py-1 hover:bg-gray-100 rounded-l-lg"
              >
                <ChevronLeft className="h-4 w-4 text-black stroke-[3]" />
              </button>
              <span className="px-3 py-1 font-bold text-black text-xs border-x-2 border-gray-300 min-w-[60px] text-center">{localRentalDays} days</span>
              <button
                onClick={() => handleRentalDaysChange(localRentalDays + 1)}
                className="px-2 py-1 hover:bg-gray-100 rounded-r-lg"
              >
                <ChevronRight className="h-4 w-4 text-black stroke-[3]" />
              </button>
            </div>
          </div>
          <div className="scale-90 origin-top-left">
            <RentalCalendar
              bookedDates={[]}
              blockedDates={[]}
              selectedDate={localStartDate}
              rentalDays={localRentalDays}
              onDateSelect={handleDateSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    items,
    wishlist,
    isOpen,
    setCartOpen,
    getTotalDeposit,
    moveToCart,
    removeFromWishlist,
  } = useCartStore();

  const totalDeposit = getTotalDeposit();
  const subtotal = items.reduce((sum, item) => {
    const days = item.rentalStart && item.rentalEnd
      ? Math.max(1, differenceInDays(new Date(item.rentalEnd), new Date(item.rentalStart)) + 1)
      : 0;
    return sum + (item.dailyPrice * days * item.quantity);
  }, 0);

  const platformFee = Math.round(subtotal * 0.05);
  const total = subtotal + totalDeposit + platformFee;

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
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[70] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({items.length})
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
                <CartDrawerItem key={`${item.productId}-${item.variantId}`} item={item} />
              ))}
            </div>
          )}

          {/* Wishlist Items */}
          {wishlist.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-bold text-black mb-3 flex items-center gap-2 uppercase tracking-tight">
                <Heart className="h-4 w-4 text-rose-600 fill-rose-600" />
                Saved for Later ({wishlist.length})
              </h3>
              <div className="space-y-3">
                {wishlist.map((item) => (
                  <div key={`${item.productId}-${item.variantId}-wishlist`} className="flex gap-3 bg-rose-50 rounded-xl p-3">
                    <div className="w-16 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-black truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-700 font-medium">₹{item.dailyPrice}/day</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => moveToCart(item.productId, item.variantId)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                        >
                          Move to Cart
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => removeFromWishlist(item.productId, item.variantId)}
                          className="text-xs text-gray-500 hover:text-red-600 font-medium"
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
          <div className="border-t p-4 space-y-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-black font-semibold">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-black font-semibold">
                <span>Deposit</span>
                <span>₹{totalDeposit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-black font-semibold">
                <span>Platform Fee (5%)</span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-black pt-2 border-t text-xl mt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-14 text-lg shadow-lg hover:shadow-rose-200 transition-all flex items-center justify-center gap-2"
              size="lg"
              onClick={handleCheckout}
            >
              {status === "unauthenticated" ? "Sign In to Checkout" : "Proceed to Checkout"}
              <ArrowRight className="h-5 w-5" />
            </Button>

            <Link
              href="/categories"
              onClick={() => setCartOpen(false)}
              className="block text-center text-sm text-black font-bold hover:text-rose-600 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

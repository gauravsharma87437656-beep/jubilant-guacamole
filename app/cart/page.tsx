"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, ArrowRight, Heart, ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Shield, Info, Minus, Plus, X } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cart";
import { useSession } from "next-auth/react";
import { RentalCalendar } from "@/components/product/rental-calendar";
import { addDays, differenceInDays } from "date-fns";

function CartItemCard({ item }: { item: CartItem }) {
  const { removeItem, moveToWishlist, updateRentalDates, updateQuantity, updateVariant } = useCartStore();
  const [productData, setProductData] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${item.productId}`);
        if (res.ok) {
          const data = await res.json();
          setProductData(data.product);
        }
      } catch (err) {
        console.error("Failed to fetch product data in cart", err);
      }
    }
    fetchProduct();
  }, [item.productId]);

  // Auto-scroll to calendar when opened
  useEffect(() => {
    if (showCalendar && calendarRef.current) {
      setTimeout(() => {
        calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    } else if (!showCalendar && cardRef.current) {
      // Scroll back up to the card when calendar hides
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    // Auto-hide calendar instantly
    setTimeout(() => {
      setShowCalendar(false);
    }, 300);
  };

  const handleRentalDaysChange = (days: number) => {
    const newDays = Math.max(1, days);
    setLocalRentalDays(newDays);
    if (localStartDate) {
      const endDate = addDays(localStartDate, newDays - 1);
      updateRentalDates(item.productId, localStartDate, endDate, item.variantId);
    }
  };

  const handleSizeChange = (newSize: string) => {
    if (!productData) return;
    // Find variant with the new size
    const variant = productData.variants.find((v: any) => v.size === newSize && v.isAvailable);
    if (variant) {
      updateVariant(item.productId, item.variantId, variant.id, variant.size, variant.color || undefined);
    }
  };

  const availableSizes = productData?.variants?.length > 0
    ? [...new Set(productData.variants.filter((v: any) => v.isAvailable).map((v: any) => v.size))]
    : [];

  return (
    <div ref={cardRef} className="group bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 scroll-mt-24">
      <div className="flex flex-col md:flex-row p-3 md:p-6 gap-3 md:gap-6">
        {/* Left Section: Image and Mobile Summary */}
        <div className="flex-shrink-0 flex flex-row md:flex-col gap-3 md:gap-4">
          <Link href={`/product/${item.productId}`} className="relative">
            <div className="w-16 h-20 md:w-32 md:h-44 bg-gray-50 rounded-xl md:rounded-2xl overflow-hidden border border-gray-100 group-hover:border-rose-100 transition-colors">
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>

          <div className="flex flex-col justify-center md:hidden flex-1 min-w-0">
            <Link href={`/product/${item.productId}`}>
              <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-[14px]">
                {item.productName}
              </h3>
            </Link>
            {item.variantSize && (
              <span className="text-[12px] font-medium text-gray-500 mt-1">Size: {item.variantSize}</span>
            )}

            <div className="flex items-center justify-between mt-3 w-full">
              <span className="text-[16px] font-bold text-gray-900 tracking-tight">₹{item.dailyPrice.toLocaleString()}</span>

              <div className="flex items-center gap-3 bg-gray-50/80 rounded-full px-2 py-1 border border-gray-100/50">
                <button
                  onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.variantId)}
                  className="p-1 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-3 text-center font-medium text-gray-900 text-[13px]">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                  className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Configuration and Pricing */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header (Desktop Only) */}
          <div className="hidden md:flex justify-between items-start mb-5">
            <div>
              <Link href={`/product/${item.productId}`}>
                <h3 className="text-xl font-bold text-gray-900 hover:text-rose-600 transition-colors tracking-tight">
                  {item.productName}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1 font-medium">
                <span>Refined Style</span>
                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                <span>₹{item.dailyPrice}/day</span>
              </div>
            </div>
            <button
              onClick={() => removeItem(item.productId, item.variantId)}
              className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
              {/* Date Range Selector */}
              <div className="flex-[1.4] w-full">
                <p className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 md:mb-2 px-1">Select Dates</p>
                <div className="flex items-center bg-white border border-gray-100 rounded-full overflow-hidden shadow-sm h-10 sm:h-14">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`flex-1 flex items-center gap-3 px-4 sm:px-5 h-full transition-all hover:bg-gray-50 group/date ${showCalendar ? 'bg-rose-50/50' : ''}`}
                  >
                    <CalendarDays className={`h-4 w-4 sm:h-5 w-5 ${showCalendar ? 'text-rose-500' : 'text-gray-400 group-hover/date:text-rose-400'}`} />
                    <div className="flex flex-col items-start leading-none gap-0.5 sm:gap-1">
                      <span className="text-[8px] sm:text-[9px] font-bold text-rose-500 uppercase">Start Date</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {localStartDate ? localStartDate.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }) : "Pick Date"}
                      </span>
                    </div>
                  </button>

                  <div className="w-[1px] h-6 sm:h-8 bg-gray-100"></div>

                  <div className="flex-1 flex items-center gap-3 px-4 sm:px-5 h-full bg-gray-50/20">
                    <CalendarDays className="h-4 w-4 sm:h-5 w-5 text-gray-300" />
                    <div className="flex flex-col items-start leading-none gap-0.5 sm:gap-1">
                      <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase">Return Date</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-500 whitespace-nowrap">
                        {localStartDate ? addDays(localStartDate, localRentalDays - 1).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }) : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration Control */}
              <div className="flex-1 w-full max-w-[180px] lg:max-w-none">
                <p className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 md:mb-2 px-1">Duration</p>
                <div className="flex items-center border border-gray-100 rounded-full h-10 sm:h-14 overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => handleRentalDaysChange(localRentalDays - 1)}
                    className="w-10 sm:w-12 h-full flex items-center justify-center hover:bg-gray-50 transition-colors border-r border-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-500" />
                  </button>
                  <span className="flex-1 text-center font-bold text-gray-900 text-sm sm:text-base">
                    {localRentalDays} <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400 ml-0.5">DAYS</span>
                  </span>
                  <button
                    onClick={() => handleRentalDaysChange(localRentalDays + 1)}
                    className="w-10 sm:w-12 h-full flex items-center justify-center hover:bg-gray-50 transition-colors border-l border-gray-50"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="w-full lg:w-1/2">
                <p className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 md:mb-2 px-1">Select Size</p>
                <div className="relative h-10 sm:h-14">
                  <select
                    value={item.variantSize}
                    onChange={(e) => handleSizeChange(e.target.value)}
                    className="w-full h-full bg-white border border-gray-100 rounded-full px-5 sm:px-6 font-semibold text-gray-900 text-xs sm:text-sm outline-none cursor-pointer hover:border-rose-200 transition-all appearance-none shadow-sm"
                  >
                    {availableSizes.map((size: any) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing and Actions Bar */}
          <div className="mt-4 md:mt-8 pt-3 md:pt-6 border-t border-gray-50 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-6 self-start">
              <div className="space-y-1">
                <p className="text-[9px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">Quantity</p>
                <div className="flex items-center bg-white border border-gray-100 rounded-full overflow-hidden shadow-sm h-9 sm:h-11 px-1">
                  <button
                    onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.variantId)}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-full"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 sm:w-10 text-center font-bold text-gray-900 text-xs sm:text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all rounded-full"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Total Price Display */}
            <div className="text-left sm:text-right">
              <div className="flex flex-col items-start sm:items-end">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[9px] sm:text-[11px] font-bold text-rose-500 uppercase tracking-widest">Total Rental</span>
                  <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter">
                    ₹{(item.dailyPrice * localRentalDays * item.quantity).toLocaleString()}
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                  Incl. {localRentalDays} days · Qty: {item.quantity}
                </p>
              </div>
            </div>
          </div>



          {/* Actions Row: Save for Later & Remove */}
          <div className="mt-3 md:mt-6 pt-3 md:pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => moveToWishlist(item.productId, item.variantId)}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-rose-600 transition-colors group/save px-2 py-1"
            >
              <Heart className="h-4 w-4 sm:h-5 w-5 transition-transform group-hover/save:scale-110" />
              <span className="uppercase tracking-widest">Save for Later</span>
            </button>

            <button
              onClick={() => removeItem(item.productId, item.variantId)}
              className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-red-500 transition-all px-2 py-1"
            >
              <Trash2 className="h-4 w-4" />
              <span className="uppercase tracking-widest">Remove</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Calendar Picker Section */}
      <div ref={calendarRef} className={`grid transition-all duration-500 ease-in-out overflow-hidden ${showCalendar ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="min-h-0">
          <div className="p-4 md:p-8 bg-gray-50/50 border-t border-gray-100">
            <div className="max-w-md mx-auto bg-white rounded-3xl p-4 md:p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Select Start Date</h4>
                  <p className="text-xs text-gray-500">Pickup date for your {localRentalDays}-day rental</p>
                </div>
              </div>

              <RentalCalendar
                bookedDates={productData?.bookedDates || []}
                blockedDates={productData?.blockedDates || []}
                selectedDate={localStartDate}
                rentalDays={localRentalDays}
                onDateSelect={handleDateSelect}
              />

              <div className="mt-8">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="w-full bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                  Confirm Dates
                </button>
              </div>
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
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showDepositBreakdown, setShowDepositBreakdown] = useState(false);
  const [showPlatformBreakdown, setShowPlatformBreakdown] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-center pt-1 pb-4 relative">
          <Link href="/" className="absolute left-0 text-gray-900 p-2 -ml-2">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">My Cart</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
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
                    <div key={item.id} className="bg-white rounded-[2rem] shadow-sm p-4 sm:p-6 border border-gray-100">
                      <div className="flex gap-4 sm:gap-6">
                        <Link href={`/product/${item.productId}`} className="flex-shrink-0">
                          <div className="w-16 h-20 sm:w-20 sm:h-24 bg-gray-50 rounded-2xl overflow-hidden">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="min-w-0">
                              <Link href={`/product/${item.productId}`}>
                                <h3 className="font-bold text-gray-900 hover:text-rose-600 line-clamp-1 text-sm sm:text-base">
                                  {item.productName}
                                </h3>
                              </Link>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {item.variantSize && (
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size: {item.variantSize}</span>
                                )}
                                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">₹{item.dailyPrice}/day</span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromWishlist(item.productId, item.variantId)}
                              className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-3 flex gap-2 sm:gap-3">
                            <Button
                              size="sm"
                              onClick={() => moveToCart(item.productId, item.variantId)}
                              className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-none rounded-full px-4 h-8 text-[10px] font-black uppercase tracking-widest"
                            >
                              Move to Cart
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromWishlist(item.productId, item.variantId)}
                              className="text-gray-400 hover:text-gray-600 h-8 text-[10px] font-black uppercase tracking-widest"
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
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 sm:p-8 sticky top-4 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <div
                    className="flex justify-between text-gray-600 font-bold text-sm cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors group"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                  >
                    <span className="flex items-center gap-1">
                      Subtotal ({rentalCount})
                      {items.length > 0 && (
                        showBreakdown ? <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-rose-500" /> : <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-rose-500" />
                      )}
                    </span>
                    <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {showBreakdown && items.length > 0 && (
                    <div className="pl-4 pr-1 py-3 space-y-2 border-l-2 border-rose-50 bg-rose-50/10 rounded-r-2xl">
                      {items.map((item) => {
                        const itemDays = item.rentalStart && item.rentalEnd
                          ? Math.max(1, differenceInDays(new Date(item.rentalEnd), new Date(item.rentalStart)) + 1)
                          : 3;
                        return (
                          <div key={item.id} className="flex justify-between text-[11px] text-gray-500 leading-tight">
                            <span className="flex-1 pr-4 line-clamp-1">{item.productName} ({item.quantity}×{itemDays}d)</span>
                            <span className="font-bold text-gray-700">₹{(item.dailyPrice * itemDays * item.quantity).toFixed(0)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div
                    className="flex justify-between text-gray-600 font-bold text-sm cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors group"
                    onClick={() => setShowDepositBreakdown(!showDepositBreakdown)}
                  >
                    <span className="flex items-center gap-1">
                      Deposit
                      {items.length > 0 && (
                        showDepositBreakdown ? <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-rose-500" /> : <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-rose-500" />
                      )}
                    </span>
                    <span className="text-gray-900">₹{totalDeposit.toFixed(2)}</span>
                  </div>
                  {showDepositBreakdown && items.length > 0 && (
                    <div className="pl-4 pr-1 py-3 space-y-2 border-l-2 border-gray-100 bg-gray-50/50 rounded-r-2xl">
                      {items.map((item) => (
                        <div key={`dep-${item.id}`} className="flex justify-between text-[11px] text-gray-500">
                          <span className="flex-1 pr-4 line-clamp-1">{item.productName} (×{item.quantity})</span>
                          <span className="font-bold text-gray-700">₹{(item.depositAmount * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div
                    className="flex justify-between text-gray-600 font-bold text-sm cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors group"
                    onClick={() => setShowPlatformBreakdown(!showPlatformBreakdown)}
                  >
                    <span className="flex items-center gap-1">
                      Platform Fee (5%)
                      {items.length > 0 && (
                        showPlatformBreakdown ? <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-rose-500" /> : <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-rose-500" />
                      )}
                    </span>
                    <span className="text-gray-900">₹{platformFee.toFixed(2)}</span>
                  </div>
                  {showPlatformBreakdown && items.length > 0 && (
                    <div className="pl-4 pr-1 py-2 space-y-1 border-l-2 border-emerald-50 bg-emerald-50/10 rounded-r-2xl">
                      <div className="flex justify-between text-[10px] text-emerald-600 font-medium italic">
                        <span>Includes secure transaction insurance</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-gray-600 font-bold text-sm">
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-black uppercase tracking-widest text-xs">Free</span>
                </div>
                <div className="border-t border-gray-100 pt-5 mt-5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-black text-gray-900 uppercase tracking-widest">Total</span>
                    <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tighter">₹{Math.round(total).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-medium text-gray-400 mb-6 flex gap-2">
                <Shield className="h-3 w-3 flex-shrink-0" />
                <span>100% Refundable Security Deposit</span>
              </div>

              <Button
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black h-14 text-base sm:text-lg rounded-2xl shadow-lg shadow-rose-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
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

      {/* Sticky Mobile Checkout Bar */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-[72px] sm:bottom-[80px] left-0 right-0 z-40 px-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-5 py-4 w-full flex flex-col gap-3 mx-auto max-w-md">

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[13px] text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] text-gray-500">
                <span>Shipping</span>
                <span className="font-bold text-gray-900">₹{(items.length > 0 ? 2 : 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="h-[1px] bg-gray-100 w-full" />

            <div className="flex justify-between items-center">
              <span className="text-[15px] font-bold text-gray-900">Total</span>
              <span className="text-[18px] font-extrabold text-gray-900">₹{Math.round(subtotal + (items.length > 0 ? 2 : 0)).toLocaleString()}</span>
            </div>

            <Button
              className="w-full bg-gray-900 hover:bg-black text-white font-bold h-[50px] rounded-2xl active:scale-[0.98] transition-all text-[15px]"
              onClick={handleCheckout}
              disabled={items.length === 0}
            >
              {status === "loading"
                ? "Loading..."
                : status === "unauthenticated"
                  ? "Sign In to Checkout"
                  : "Checkout"}
            </Button>
          </div>
        </div>
      )}

      {/* Content Spacer for Sticky Bar + Bottom Dock space */}
      <div className="h-[280px] lg:hidden"></div>
    </div>
  );
}

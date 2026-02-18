"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Star, Truck, Shield, Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { useParams } from "next/navigation";
import { RentalCalendar } from "@/components/product/rental-calendar";
import { addDays } from "date-fns";

interface DateRange {
  startDate: string;
  endDate: string;
  reason?: string | null;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  dailyPrice: number;
  weeklyPrice: number | null;
  depositAmount: number;
  rating: number;
  reviewCount: number;
  condition: string;
  vendor: { id: string; businessName: string; businessSlug: string };
  brand: { name: string } | null;
  category: { name: string; slug: string } | null;
  variants: { id: string; size: string; color: string | null; inventory: number; isAvailable: boolean }[];
  bookedDates: DateRange[];
  blockedDates: DateRange[];
}

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [rentalDays, setRentalDays] = useState(3);
  const [rentalStartDate, setRentalStartDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((state) => state.addItem);

  // Auto-scroll to calendar when opened
  useEffect(() => {
    if (showCalendar && calendarRef.current) {
      setTimeout(() => {
        calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300); // Wait for transition
    }
  }, [showCalendar]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) {
          throw new Error("Product not found");
        }
        const data = await res.json();
        setProduct(data.product);
      } catch {
        setError("Product not found or unavailable");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600 text-lg">{error || "Product not found"}</p>
        <Link href="/categories" className="text-rose-600 hover:underline">
          ← Back to Categories
        </Link>
      </div>
    );
  }

  const sizes = product.variants.length > 0
    ? [...new Set(product.variants.filter(v => v.isAvailable).map(v => v.size))]
    : [];
  const colors = product.variants.length > 0
    ? [...new Set(product.variants.filter(v => v.isAvailable && v.color).map(v => v.color!))]
    : [];

  const total = product.dailyPrice * rentalDays;

  // Check if any date in the selected rental range is unavailable
  const isRangeConflicting = (startDate: Date): boolean => {
    const allUnavailable = [
      ...product.bookedDates,
      ...product.blockedDates,
    ];
    for (let i = 0; i < rentalDays; i++) {
      const checkDate = addDays(startDate, i);
      const checkTime = checkDate.getTime();
      for (const range of allUnavailable) {
        const rangeStart = new Date(range.startDate);
        const rangeEnd = new Date(range.endDate);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd.setHours(23, 59, 59, 999);
        if (checkTime >= rangeStart.getTime() && checkTime <= rangeEnd.getTime()) {
          return true;
        }
      }
    }
    return false;
  };

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (!rentalStartDate) {
      toast.error("Please select a rental start date from the calendar");
      return;
    }

    // Check for conflicts in the rental range
    if (isRangeConflicting(rentalStartDate)) {
      toast.error("Some dates in your rental period are already booked. Please pick different dates.");
      return;
    }

    const startDate = rentalStartDate;
    const endDate = addDays(rentalStartDate, rentalDays - 1);

    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
      variantSize: selectedSize || "One Size",
      dailyPrice: product.dailyPrice,
      weeklyPrice: product.weeklyPrice || undefined,
      depositAmount: product.depositAmount,
      vendorId: product.vendor.id,
      vendorName: product.vendor.businessName,
      rentalStart: startDate,
      rentalEnd: endDate,
    });

    toast.success("Added to cart!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/categories" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="h-4 w-4" /> Back to Categories
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-[4/5] bg-white rounded-lg overflow-hidden mb-4 relative">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImage(idx)} className={`w-20 h-24 rounded-md overflow-hidden border-2 relative ${selectedImage === idx ? "border-rose-500" : "border-transparent"}`}>
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="80px"
                    priority={idx === 0}
                    fetchPriority={idx === 0 ? "high" : "auto"}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="mb-2">
              <Link href={`/vendor/${product.vendor.businessSlug}`} className="text-sm text-rose-600 hover:underline">
                {product.vendor.businessName}
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="ml-2 text-gray-600">{product.rating} ({product.reviewCount} reviews)</span>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-gray-900">₹{product.dailyPrice}</span>
                <span className="text-gray-500">/day</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Refundable deposit: ₹{product.depositAmount}</p>
            </div>

            {sizes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Select Size</h3>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 border rounded-md font-medium ${selectedSize === size ? "border-rose-500 bg-rose-50 text-rose-700" : "border-gray-300 hover:border-gray-400"}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Available Colors</h3>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <span key={color} className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Premium Booking Section */}
            <div className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              {/* Pricing Header */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rental Price</p>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-rose-600">₹{product.dailyPrice}</span>
                    <span className="text-sm font-medium text-gray-400 ml-1">/day</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Original Price</p>
                  <p className="text-xl font-medium text-gray-400 line-through">₹{Math.round(product.dailyPrice * 15)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Security Deposit</p>
                  <p className="text-xl font-bold text-gray-900">₹{product.depositAmount}</p>
                </div>
              </div>

              {/* Rental Duration Adjustment (Moved above Date Selectors) */}
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-700 mb-2 ml-1">Rent for how many days?</p>
                <div className="flex items-center border-2 border-gray-100 rounded-xl w-fit overflow-hidden">
                  <button onClick={() => setRentalDays(Math.max(1, rentalDays - 1))} className="px-4 py-2 hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="px-6 py-2 font-bold text-gray-900 border-x-2 border-gray-100 min-w-[100px] text-center">{rentalDays} days</span>
                  <button onClick={() => setRentalDays(rentalDays + 1)} className="px-4 py-2 hover:bg-gray-50 transition-colors">
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Date Selectors */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Start Date</label>
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-100 rounded-xl hover:border-rose-200 transition-all text-sm font-medium text-gray-900"
                  >
                    <span>{rentalStartDate ? rentalStartDate.toLocaleDateString("en-IN") : "Select Date"}</span>
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">End Date</label>
                  <div
                    className="w-full h-[48px] flex items-center justify-between px-4 border-2 border-gray-50 bg-gray-50 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed"
                  >
                    <span>{rentalStartDate ? addDays(rentalStartDate, rentalDays - 1).toLocaleDateString("en-IN") : "mm/dd/yyyy"}</span>
                    <Calendar className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </div>

              {/* Expandable Calendar */}
              <div ref={calendarRef} className={`grid transition-all duration-500 ease-in-out overflow-hidden ${showCalendar ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="min-h-0">
                  <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                    <RentalCalendar
                      bookedDates={product.bookedDates}
                      blockedDates={product.blockedDates}
                      selectedDate={rentalStartDate}
                      rentalDays={rentalDays}
                      onDateSelect={(date) => {
                        setRentalStartDate(date);
                        setTimeout(() => setShowCalendar(false), 1000);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary Box */}
              {rentalStartDate && (
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-3 border-2 border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Rental ({rentalDays} days × ₹{product.dailyPrice})</span>
                    <span className="font-bold text-gray-900">₹{total}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Security Deposit (refundable)</span>
                    <span className="font-bold text-gray-900">₹{product.depositAmount}</span>
                  </div>
                  <div className="pt-3 border-t-2 border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Payable</span>
                    <span className="text-xl font-black text-rose-600">₹{total + product.depositAmount}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    handleAddToCart();
                    const router = (window as any).nextRouter || { push: (url: string) => window.location.href = url };
                    if (rentalStartDate) {
                      window.location.href = "/checkout";
                    }
                  }}
                  size="xl"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-lg h-16 rounded-2xl shadow-lg shadow-rose-100 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Book Now — Pay with Razorpay
                </Button>

                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-gray-200 text-gray-900 font-bold h-12 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Add to Cart
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <Shield className="h-3 w-3" />
                <span>Escrow protected</span>
                <span className="text-gray-200">•</span>
                <span>Deposit refunded in 7 days</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Product Details</h3>
              <dl className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Condition</dt>
                  <dd className="text-sm font-bold text-gray-900">{product.condition}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Brand</dt>
                  <dd className="text-sm font-bold text-gray-900">{product.brand?.name || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Category</dt>
                  <dd className="text-sm font-bold text-gray-900">{product.category?.name || "N/A"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

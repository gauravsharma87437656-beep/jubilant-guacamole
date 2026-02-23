"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Star, Truck, Shield, Calendar, CalendarDays, ChevronLeft, ChevronRight, ChevronDown, Loader2, ShoppingBag, Clock } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { useParams } from "next/navigation";
import { RentalCalendar } from "@/components/product/rental-calendar";
import { addDays } from "date-fns";
import useEmblaCarousel from "embla-carousel-react";
import { addRecentlyViewed, getRecentlyViewed, RecentlyViewedItem } from "@/lib/recently-viewed";
import { useSession } from "next-auth/react";
import { ProductCard } from "@/components/product/product-card";

interface DateRange {
  startDate: string;
  endDate: string;
  reason?: string | null;
  variantId?: string | null;
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
  const bookingRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((state) => state.addItem);
  const { data: session } = useSession();
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);

  // Embla carousel for mobile images
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps'
  });

  // Update selected image when carousel scrolls
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => {
      setSelectedImage(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  // Handle selected image change (from thumbnails)
  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(selectedImage);
  }, [selectedImage, emblaApi]);

  // Auto-scroll to calendar/booking
  useEffect(() => {
    if (showCalendar && calendarRef.current) {
      setTimeout(() => {
        calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    } else if (!showCalendar && bookingRef.current) {
      // Scroll back up to the booking details when calendar hides
      bookingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

        // Auto-select first available size
        if (data.product?.variants?.length > 0) {
          const availableVariant = data.product.variants.find((v: any) => v.isAvailable);
          if (availableVariant) {
            setSelectedSize(availableVariant.size);
          }
        }
      } catch {
        setError("Product not found or unavailable");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  // Track recently viewed + load recently viewed list
  useEffect(() => {
    if (product) {
      addRecentlyViewed({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0],
        dailyPrice: product.dailyPrice,
      }, session?.user?.id);

      // Load recently viewed (exclude current product)
      const viewed = getRecentlyViewed(session?.user?.id).filter(item => item.id !== product.id);
      setRecentlyViewed(viewed.slice(0, 8));
    }
  }, [product, session?.user?.id]);

  // Fetch similar products (same category)
  useEffect(() => {
    if (product?.category?.slug) {
      fetch(`/api/products?category=${product.category.slug}&limit=12`)
        .then(res => res.json())
        .then(data => {
          const filtered = (data.products || []).filter((p: any) => p.id !== product.id);
          setSimilarProducts(filtered.slice(0, 12));
        })
        .catch(() => { });
    }
  }, [product?.id, product?.category?.slug]);

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

  // Find selected variant by size
  const selectedVariant = selectedSize
    ? product.variants.find(v => v.size === selectedSize && v.isAvailable)
    : null;
  const selectedVariantId = selectedVariant?.id || null;
  const variantInventory = selectedVariant?.inventory ?? 1;

  const total = product.dailyPrice * rentalDays;

  // Check if any date in the selected rental range is unavailable (variant-aware)
  const isRangeConflicting = (startDate: Date): boolean => {
    for (let i = 0; i < rentalDays; i++) {
      const checkDate = addDays(startDate, i);
      checkDate.setHours(0, 0, 0, 0);
      const checkTime = checkDate.getTime();

      // Check blocked dates (always block all variants)
      for (const range of product.blockedDates) {
        const rangeStart = new Date(range.startDate);
        const rangeEnd = new Date(range.endDate);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd.setHours(23, 59, 59, 999);
        if (checkTime >= rangeStart.getTime() && checkTime <= rangeEnd.getTime()) {
          return true;
        }
      }

      // Check booked dates per-variant
      if (selectedVariantId) {
        // Count how many bookings exist for this variant on this date
        let bookingCount = 0;
        for (const range of product.bookedDates) {
          if (range.variantId !== selectedVariantId) continue;
          const rangeStart = new Date(range.startDate);
          const rangeEnd = new Date(range.endDate);
          rangeStart.setHours(0, 0, 0, 0);
          rangeEnd.setHours(23, 59, 59, 999);
          if (checkTime >= rangeStart.getTime() && checkTime <= rangeEnd.getTime()) {
            bookingCount++;
          }
        }
        if (bookingCount >= variantInventory) {
          return true;
        }
      } else if (product.variants.length === 0) {
        // No variants — any booking blocks the date
        for (const range of product.bookedDates) {
          const rangeStart = new Date(range.startDate);
          const rangeEnd = new Date(range.endDate);
          rangeStart.setHours(0, 0, 0, 0);
          rangeEnd.setHours(23, 59, 59, 999);
          if (checkTime >= rangeStart.getTime() && checkTime <= rangeEnd.getTime()) {
            return true;
          }
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
      variantId: selectedVariantId || undefined,
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
    <div className="min-h-screen bg-gray-50 pt-2 sm:pt-6 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/categories" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="h-4 w-4" /> Back to Categories
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Carousel Viewport */}
            <div
              className="overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing"
              ref={emblaRef}
            >
              <div className="flex">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex-[0_0_100%] min-w-0 aspect-[4/5] relative bg-white"
                  >
                    <Image
                      src={img}
                      alt={product.name}
                      fill
                      priority={idx === 0}
                      fetchPriority={idx === 0 ? "high" : "auto"}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-0.5">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-24 h-28 rounded-xl overflow-hidden border-2 transition-all duration-300 relative ${selectedImage === idx
                    ? "border-rose-500 ring-4 ring-rose-50 shadow-lg scale-[1.02]"
                    : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>





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
            <div ref={bookingRef} className="lg:mt-0 bg-white border border-gray-100 rounded-[2rem] p-5 sm:p-8 shadow-sm scroll-mt-24">
              {/* Product Header inside Card */}
              <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-50">
                <Link href={`/vendor/${product.vendor.businessSlug}`} className="text-xs sm:text-sm font-medium text-rose-500 uppercase tracking-wider hover:text-rose-600 transition-colors">
                  {product.vendor.businessName}
                </Link>
                <div className="flex items-start justify-between gap-3 mt-2">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight leading-tight">{product.name}</h1>
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 flex-shrink-0">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
                    <span className="text-xs text-gray-400">({product.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Pricing Header + Duration */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="space-y-0.5">
                  <p className="text-[9px] sm:text-[10px] font-normal text-gray-400 uppercase tracking-wider">Rental Price</p>
                  <div className="flex items-baseline">
                    <span className="text-lg sm:text-2xl font-semibold text-rose-600">₹{product.dailyPrice}</span>
                    <span className="text-[10px] sm:text-xs font-normal text-gray-400 ml-0.5">/day</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] sm:text-[10px] font-normal text-gray-400 uppercase tracking-wider">Original Price</p>
                  <p className="text-base sm:text-xl font-normal text-gray-300 line-through">₹{Math.round(product.dailyPrice * 15)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] sm:text-[10px] font-normal text-gray-400 uppercase tracking-wider">Deposit</p>
                  <p className="text-base sm:text-xl font-medium text-gray-900">₹{product.depositAmount}</p>
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-normal text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                  <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden shadow-sm h-9 sm:h-10 w-fit">
                    <button
                      onClick={() => setRentalDays(Math.max(1, rentalDays - 1))}
                      className="px-2.5 sm:px-3 h-full hover:bg-gray-50 transition-colors border-r border-gray-100"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />
                    </button>
                    <span className="px-3 sm:px-4 font-medium text-gray-900 min-w-[50px] sm:min-w-[60px] text-center text-xs sm:text-sm">
                      {rentalDays} <span className="text-[8px] sm:text-[9px] font-medium text-gray-400">DAYS</span>
                    </span>
                    <button
                      onClick={() => setRentalDays(rentalDays + 1)}
                      className="px-2.5 sm:px-3 h-full hover:bg-gray-50 transition-colors border-l border-gray-100"
                    >
                      <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Booking Configuration Section */}
              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-normal text-gray-500 uppercase tracking-widest mb-1.5 px-1">Size</p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size === selectedSize ? "" : size)}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${selectedSize === size
                            ? "border-rose-500 bg-rose-50 text-rose-600"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Selector - Combined Pill Bar (matching cart style) */}
                <div>
                  <p className="text-[10px] sm:text-[11px] font-normal text-gray-500 uppercase tracking-widest mb-1.5 px-1">Select Dates</p>
                  <div className="flex items-center bg-white border border-gray-200 rounded-full overflow-hidden shadow-sm h-12 sm:h-14">
                    <button
                      onClick={() => setShowCalendar(!showCalendar)}
                      className={`flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 h-full transition-all hover:bg-gray-50 group/date ${showCalendar ? 'bg-rose-50/50' : ''}`}
                    >
                      <CalendarDays className={`h-4 w-4 ${showCalendar ? 'text-rose-500' : 'text-gray-400 group-hover/date:text-rose-400'}`} />
                      <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className="text-[8px] sm:text-[9px] font-medium text-rose-500 uppercase">Start Date</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                          {rentalStartDate ? rentalStartDate.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }) : "Pick Date"}
                        </span>
                      </div>
                    </button>

                    <div className="w-[1px] h-6 sm:h-8 bg-gray-100"></div>

                    <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 h-full bg-gray-50/20">
                      <CalendarDays className="h-4 w-4 text-gray-300" />
                      <div className="flex flex-col items-start leading-none gap-0.5">
                        <span className="text-[8px] sm:text-[9px] font-medium text-gray-400 uppercase">Return Date</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-500 whitespace-nowrap">
                          {rentalStartDate ? addDays(rentalStartDate, rentalDays - 1).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }) : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Calendar */}
              <div ref={calendarRef} className={`grid transition-all duration-500 ease-in-out overflow-hidden ${showCalendar ? 'grid-rows-[1fr] opacity-100 mb-8' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="min-h-0">
                  <div className="p-3 sm:p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <RentalCalendar
                      bookedDates={product.bookedDates}
                      blockedDates={product.blockedDates}
                      selectedDate={rentalStartDate}
                      rentalDays={rentalDays}
                      onDateSelect={(date) => {
                        setRentalStartDate(date);
                        setTimeout(() => setShowCalendar(false), 300);
                      }}
                      selectedVariantId={selectedVariantId}
                      variants={product.variants.map(v => ({ id: v.id, size: v.size, inventory: v.inventory }))}
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary Box */}
              {rentalStartDate && (
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-3 border border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Rental ({rentalDays} days × ₹{product.dailyPrice})</span>
                    <span className="font-medium text-gray-900">₹{total}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Security Deposit (refundable)</span>
                    <span className="font-medium text-gray-900">₹{product.depositAmount}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Payable</span>
                    <span className="text-xl font-semibold text-rose-600">₹{total + product.depositAmount}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons - Side by Side */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    handleAddToCart();
                    if (rentalStartDate) {
                      window.location.href = "/checkout";
                    }
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm sm:text-base h-12 sm:h-14 rounded-2xl shadow-lg shadow-rose-100 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Book Now
                </Button>

                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="flex-1 border-2 border-gray-200 text-gray-900 font-medium text-sm sm:text-base h-12 sm:h-14 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600 leading-relaxed text-sm">{product.description}</p>
            </div>

            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
              <dl className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Condition</dt>
                  <dd className="text-sm font-medium text-gray-900">{product.condition}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Brand</dt>
                  <dd className="text-sm font-medium text-gray-900">{product.brand?.name || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Category</dt>
                  <dd className="text-sm font-medium text-gray-900">{product.category?.name || "N/A"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
              {recentlyViewed.slice(0, 4).map((item) => (
                <Link key={item.id} href={`/product/${item.slug || item.id}`} className="group">
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-50 mb-2 group-hover:shadow-lg transition-shadow duration-300">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-1">{item.name}</h3>
                  <p className="text-xs sm:text-sm font-bold text-rose-600">₹{item.dailyPrice.toLocaleString('en-IN')}/day</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
              {similarProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

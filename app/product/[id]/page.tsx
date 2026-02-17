"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, Truck, Shield, Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { useParams } from "next/navigation";

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
}

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [rentalDays, setRentalDays] = useState(3);
  const addItem = useCartStore((state) => state.addItem);

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

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + rentalDays);

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

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Rental Duration</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <button onClick={() => setRentalDays(Math.max(1, rentalDays - 1))} className="px-3 py-2 hover:bg-gray-100">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{rentalDays} days</span>
                  <button onClick={() => setRentalDays(rentalDays + 1)} className="px-3 py-2 hover:bg-gray-100">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button onClick={handleAddToCart} size="xl" className="w-full">
                Add to Cart - ₹{total}
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto text-gray-400" />
                <p className="text-xs text-gray-500 mt-1">Free Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto text-gray-400" />
                <p className="text-xs text-gray-500 mt-1">Secure Deposit</p>
              </div>
              <div className="text-center">
                <Calendar className="h-6 w-6 mx-auto text-gray-400" />
                <p className="text-xs text-gray-500 mt-1">Easy Returns</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Details</h3>
              <dl className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Condition</dt>
                  <dd className="text-sm font-medium text-gray-900">{product.condition}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Brand</dt>
                  <dd className="text-sm font-medium text-gray-900">{product.brand?.name || "N/A"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

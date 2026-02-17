"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const HeroCarousel = dynamic(() => import("@/components/home/hero-carousel").then((mod) => mod.HeroCarousel), {
  ssr: true,
  loading: () => <div className="h-[60vh] md:h-[calc(100vh-80px)] bg-gray-200 animate-pulse" />,
});

const DropsSection = dynamic(() => import("@/components/home/drops-section").then((mod) => mod.DropsSection), {
  ssr: true,
  loading: () => <div className="h-96 w-full bg-gray-50 animate-pulse rounded-lg" />,
});

const Testimonials = dynamic(() => import("@/components/home/testimonials").then((mod) => mod.Testimonials), {
  ssr: true,
});

const FeaturedBrands = dynamic(() => import("@/components/home/featured-brands").then((mod) => mod.FeaturedBrands), {
  ssr: true,
  loading: () => <div className="h-48 w-full bg-white animate-pulse" />,
});

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  dailyPrice: number;
  rating: number;
  reviewCount: number;
  category: {
    name: string;
  };
  vendor: {
    businessName: string;
  };
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [], isLoading: catLoading } = useQuery<Category[]>({
    queryKey: ['home-categories'],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      return data.categories?.slice(0, 4) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: products = [], isLoading: prodLoading } = useQuery<Product[]>({
    queryKey: ['home-products'],
    queryFn: async () => {
      const res = await fetch("/api/products?featured=true&limit=8");
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return data.products || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loading = catLoading || prodLoading;

  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category?.name?.toLowerCase() === selectedCategory.toLowerCase())
    : products;

  const [bestsellerRef, bestsellerApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  const scrollPrev = useCallback(() => bestsellerApi && bestsellerApi.scrollPrev(), [bestsellerApi]);
  const scrollNext = useCallback(() => bestsellerApi && bestsellerApi.scrollNext(), [bestsellerApi]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* Hero Section with Carousel */}
      <HeroCarousel />

      {/* Drops Section  */}
      <DropsSection />

      {/* Featured Brands */}
      <FeaturedBrands />


      {/* Best Deals / Featured Section */}
      <section className="py-12 md:py-16 bg-white" aria-labelledby="best-deals-title">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center mb-10">
            <h3 id="best-deals-title" className="text-2xl md:text-3xl font-bold text-primary">Best Deals for Happy Occasions</h3>
            <div className="hidden md:flex gap-2" role="navigation" aria-label="Promo navigation">
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Previous promo">
                <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              </button>
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Next promo">
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Promo Card 1 */}
            <article className="relative overflow-hidden rounded-2xl aspect-[1.8/1] group shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/60 to-transparent flex flex-col justify-center p-8">
                <div className="bg-white/30 backdrop-blur-sm self-start px-3 py-1 rounded text-xs font-bold uppercase text-white mb-2">Discount</div>
                <h4 className="text-4xl font-black text-white mb-1">35% <span className="text-xl">OFF</span></h4>
                <p className="text-white font-bold mb-4">Premium Lehengas</p>
              </div>
            </article>
            {/* Promo Card 2 */}
            <article className="relative overflow-hidden rounded-2xl aspect-[1.8/1] group shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-primary to-emerald-800 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-transparent flex flex-col justify-center p-8">
                <h4 className="text-4xl font-black text-white mb-1">50% <span className="text-xl">OFF</span></h4>
                <p className="text-white font-bold mb-4">Sherwanis & Suits</p>
                <Link href="/categories" prefetch={false} className="bg-secondary text-white font-bold px-5 py-2 rounded-full w-fit hover:bg-secondary/90 transition-colors inline-block">
                  Check Now
                </Link>
              </div>
            </article>
            {/* Promo Card 3 */}
            <article className="relative overflow-hidden rounded-2xl aspect-[1.8/1] group shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/60 to-transparent flex flex-col justify-center p-8">
                <h4 className="text-white text-2xl font-bold mb-2">Weekend Specials</h4>
                <p className="text-white/90 text-sm mb-4">Rent for 2 days, get 1 day free</p>
                <Link href="/categories" prefetch={false} className="bg-white text-orange-600 font-bold px-5 py-2 rounded-full w-fit hover:bg-gray-50 transition-colors inline-block">
                  Shop Now
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Categories & Filter Pills */}
      <section className="py-8 bg-gray-50" aria-labelledby="bestsellers-title">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative group/section">
          <div className="flex flex-wrap gap-3 justify-center mb-12" role="tablist" aria-label="Filter by category">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`font-semibold px-6 py-2 rounded-full shadow-md transition-colors ${selectedCategory === null
                ? "bg-primary text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary"
                }`}
              role="tab"
              aria-selected={selectedCategory === null}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`font-semibold px-6 py-2 rounded-full transition-colors ${selectedCategory === cat.name
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary"
                  }`}
                role="tab"
                aria-selected={selectedCategory === cat.name}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-end mb-8 px-4">
            <div>
              <h3 id="bestsellers-title" className="text-3xl font-black text-primary mb-2">Our Bestsellers</h3>
              <p className="text-black">Explore our most popular rental choices this season.</p>
            </div>
            {/* Navigation Buttons */}
            <div className="hidden md:flex gap-2" role="navigation" aria-label="Product carousel navigation">
              <button
                onClick={scrollPrev}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-colors"
                aria-label="Previous products"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={scrollNext}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-colors"
                aria-label="Next products"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available at the moment.</p>
            </div>
          ) : (
            <div className="overflow-hidden p-4 -m-4" ref={bestsellerRef}>
              <div className="flex -ml-6">
                {filteredProducts.map((product, index) => (
                  <div key={product.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-6 min-w-0">
                    <Link href={`/product/${product.id}`} prefetch={false} className="group bg-white rounded-[2rem] p-3 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 block h-full" aria-label={`View ${product.name}`}>
                      <div className="relative aspect-[3/4] rounded-[1.5rem] overflow-hidden mb-3 bg-gray-100">
                        {product.rating >= 4 && (
                          <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10 shadow-md">
                            Top Rated
                          </span>
                        )}

                        <img
                          src={product.images[0]}
                          alt={product.name}
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center" style={{ display: 'none' }}>
                          <span className="material-symbols-outlined text-6xl text-gray-400">checkroom</span>
                        </div>
                      </div>

                      <div className="space-y-1 px-2 pb-2">
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] font-bold text-black uppercase tracking-widest line-clamp-1">{product.category.name}</p>
                          <div className="flex items-center text-amber-400 gap-1 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded-md" aria-label={`Rating: ${product.rating} out of 5`}>
                            <span className="material-symbols-outlined text-sm" aria-hidden="true">star</span>
                            <span className="text-amber-700 text-[10px]">{product.rating > 0 ? product.rating.toFixed(1) : "New"}</span>
                          </div>
                        </div>

                        <h4 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-primary transition-colors line-clamp-1">{product.name}</h4>

                        <div className="flex items-center justify-between pt-2 mt-1">
                          <div className="flex flex-col">
                            <span className="text-xs text-black font-medium line-through">₹{Math.round(product.dailyPrice * 1.2)}</span>
                            <span className="text-2xl font-black text-gray-900">₹{product.dailyPrice}</span>
                          </div>
                          <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-md hover:bg-gray-800 transition-all group-hover:scale-110" aria-label={`Add ${product.name} to cart`}>
                            <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Become a Vendor Banner */}
      <section className="py-20 bg-white" aria-labelledby="vendor-cta-title">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="bg-primary rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
            <div className="relative z-10 max-w-xl text-center md:text-left">
              <h3 id="vendor-cta-title" className="text-3xl md:text-5xl font-black text-white mb-6">Start Your Rental Business</h3>
              <p className="text-white/80 text-lg mb-8">Join thousands of vendors earning passive income by listing their premium ethnic wear on RentSquire.</p>
              <Link href="/vendor/signup" prefetch={false} className="inline-block bg-secondary text-white font-bold text-lg px-8 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-secondary/30">
                Become a Vendor
              </Link>
            </div>
            <div className="hidden md:block relative z-10" aria-hidden="true">
              <div className="w-64 h-64 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-[8rem] text-white">storefront</span>
              </div>
            </div>
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" aria-hidden="true"></div>
          </div>
        </div>
      </section>

    </div>
  );
}

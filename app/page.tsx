"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product/product-card";

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

const RecentlyViewed = dynamic(() => import("@/components/home/recently-viewed").then((mod) => mod.RecentlyViewed), {
  ssr: false,
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
  const router = useRouter();
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  const { data: categories = [], isLoading: catLoading } = useQuery<Category[]>({
    queryKey: ['home-categories'],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      return data.categories?.slice(0, 4) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: products = [], isLoading: prodLoading } = useQuery<Product[]>({
    queryKey: ['home-products'],
    queryFn: async () => {
      const res = await fetch("/api/products?featured=true&limit=8");
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return data.products || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!bestsellerApi) return;

    onSelect(bestsellerApi);
    setScrollSnaps(bestsellerApi.scrollSnapList());
    bestsellerApi.on('select', onSelect);
    bestsellerApi.on('reInit', onSelect);
  }, [bestsellerApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    bestsellerApi && bestsellerApi.scrollTo(index);
  }, [bestsellerApi]);

  const scrollPrev = useCallback(() => bestsellerApi && bestsellerApi.scrollPrev(), [bestsellerApi]);
  const scrollNext = useCallback(() => bestsellerApi && bestsellerApi.scrollNext(), [bestsellerApi]);

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/categories?search=${encodeURIComponent(mobileSearchQuery)}`);
    }
  };

  // Cloth rental categories with icons
  const rentalCategories = [
    { name: "All", slug: "", icon: "✨" },
    { name: "Men", slug: "male", icon: "👔" },
    { name: "Women", slug: "female", icon: "👗" },
    { name: "Ethnic", slug: "ethnic", icon: "🪷" },
    { name: "Party", slug: "party-wear", icon: "🎉" },
    { name: "Wedding", slug: "wedding", icon: "💍" },
    { name: "Casual", slug: "casual", icon: "👕" },
    { name: "Formal", slug: "formal", icon: "🤵" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* Mobile: Sticky Search Bar + Category Strip */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100">
        {/* Search Bar */}
        <div className="px-4 pt-3 pb-2">
          <form onSubmit={handleMobileSearch} className="relative group">
            <input
              type="text"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              placeholder="Search for your dream outfit..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-300 transition-all shadow-sm shadow-gray-100/50"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
          </form>
        </div>

        {/* Category Row */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-0.5 px-2 py-1 min-w-max">
            {rentalCategories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.slug ? `/categories/${cat.slug}` : "/categories"}
                className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl hover:bg-gray-50 transition-colors min-w-[52px]"
              >
                <span className="text-[20px] leading-none">{cat.icon}</span>
                <span className="text-[10px] font-semibold text-gray-600 whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section with Carousel */}
      <HeroCarousel />

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Drops Section  */}
      <DropsSection />

      {/* Featured Brands */}
      <FeaturedBrands />


      {/* Best Deals / Featured Section */}

      <section className="py-4 md:py-8 bg-gray-50" aria-labelledby="bestsellers-title">
        <div className="w-full relative group/section">
          <div className="flex md:flex-wrap gap-2 md:gap-3 md:justify-center mb-4 md:mb-12 px-3 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Filter by category">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`font-semibold px-4 py-1.5 md:px-6 md:py-2 rounded-full shadow-md transition-colors text-[13px] md:text-base whitespace-nowrap ${selectedCategory === null
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
                className={`font-semibold px-4 py-1.5 md:px-6 md:py-2 rounded-full transition-colors text-[13px] md:text-base whitespace-nowrap ${selectedCategory === cat.name
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

          <div className="flex justify-between items-end mb-4 md:mb-8 px-3 md:px-4">
            <div>
              <h3 id="bestsellers-title" className="text-xl md:text-3xl font-black text-primary mb-1 md:mb-2">Our Bestsellers</h3>
              <p className="text-[13px] md:text-base text-black">Explore our most popular rental choices this season.</p>
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
            <>
              <div className="overflow-hidden p-4 -m-4" ref={bestsellerRef}>
                <div className="flex -ml-3 md:-ml-6">
                  {filteredProducts.map((product, index) => (
                    <div key={product.id} className="flex-[0_0_50%] sm:flex-[0_0_40%] md:flex-[0_0_33.333333%] lg:flex-[0_0_20%] pl-3 md:pl-6 min-w-0">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots Navigation */}
              <div className="flex justify-center gap-2 mt-8 md:hidden">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === selectedIndex ? "bg-[#8b0000] scale-125" : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    onClick={() => scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

    </div>
  );
}

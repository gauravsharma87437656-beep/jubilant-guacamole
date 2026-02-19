"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Star, Filter, X, Check, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "@/components/shared/pagination";
import { ProductCard } from "@/components/product/product-card";

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  dailyPrice: number;
  deposit: number;
  rating: number;
  reviewCount: number;
  vendor: {
    businessName: string;
  };
  category: {
    name: string;
    slug: string;
  };
  brand?: {
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

interface Occasion {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface ProductResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const GENDER_CONFIG: Record<string, { label: string; description: string; gradient: string }> = {
  male: {
    label: "Men's Collection",
    description: "Discover premium rental outfits for men — from sharp formals to trendy casuals.",
    gradient: "from-slate-900 via-blue-900 to-indigo-900",
  },
  female: {
    label: "Women's Collection",
    description: "Explore stunning rental outfits for women — from elegant lehengas to stylish western wear.",
    gradient: "from-rose-600 via-pink-600 to-purple-700",
  },
};

function GenderPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const genderKey = slug.toLowerCase();
  const config = GENDER_CONFIG[genderKey];

  // If slug is not "male" or "female", treat it as a regular category
  const isGenderPage = !!config;

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category") || null
  );
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(
    searchParams.get("occasion") || null
  );
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || ""
  });
  const [minRating, setMinRating] = useState<number | null>(
    searchParams.get("minRating") ? parseInt(searchParams.get("minRating")!) : null
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const ITEMS_PER_PAGE = 12;

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      return data.categories || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch occasions
  const { data: occasions = [] } = useQuery<Occasion[]>({
    queryKey: ["occasions"],
    queryFn: async () => {
      const res = await fetch("/api/occasions?active=true");
      if (!res.ok) throw new Error("Failed to fetch occasions");
      const data = await res.json();
      return data.occasions || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Build query string for products
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (isGenderPage) {
      params.append("gender", genderKey);
      if (selectedCategory) params.append("category", selectedCategory);
    } else {
      params.append("category", slug);
    }
    if (selectedOccasion) params.append("occasion", selectedOccasion);
    if (priceRange.min) params.append("minPrice", priceRange.min);
    if (priceRange.max) params.append("maxPrice", priceRange.max);
    if (minRating) params.append("minRating", minRating.toString());
    params.append("sort", sortBy);
    params.append("page", currentPage.toString());
    params.append("limit", ITEMS_PER_PAGE.toString());
    return params.toString();
  };

  // Fetch products
  const {
    data: productData,
    isLoading,
    isFetching,
  } = useQuery<ProductResponse>({
    queryKey: [
      "gender-products",
      slug,
      selectedCategory,
      selectedOccasion,
      priceRange.min,
      priceRange.max,
      minRating,
      sortBy,
      currentPage,
    ],
    queryFn: async () => {
      const res = await fetch(`/api/products?${buildQueryString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return await res.json();
    },
    staleTime: 2 * 60 * 1000,
  });

  const products = productData?.products || [];
  const pagination = productData?.pagination;
  const totalProducts = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  // Update URL on filter change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedOccasion) params.set("occasion", selectedOccasion);
    if (priceRange.min) params.set("minPrice", priceRange.min);
    if (priceRange.max) params.set("maxPrice", priceRange.max);
    if (minRating) params.set("minRating", minRating.toString());
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", currentPage.toString());
    const qs = params.toString();
    router.replace(`/categories/${slug}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [selectedCategory, selectedOccasion, priceRange, minRating, sortBy, currentPage, slug, router]);

  const handleCategorySelect = (catSlug: string | null) => {
    setSelectedCategory(catSlug);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedOccasion(null);
    setPriceRange({ min: "", max: "" });
    setMinRating(null);
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategory !== null ||
    selectedOccasion !== null ||
    priceRange.min !== "" ||
    priceRange.max !== "" ||
    minRating !== null ||
    sortBy !== "newest";

  // For non-gender pages, render a simpler category page
  const pageTitle = isGenderPage ? config.label : slug.replace(/-/g, " ");
  const pageDescription = isGenderPage
    ? config.description
    : `Browse products in ${slug.replace(/-/g, " ")}`;
  const gradientClass = isGenderPage
    ? config.gradient
    : "from-gray-800 to-gray-900";

  // Filter sidebar content (shared between mobile drawer and desktop sidebar)
  const filterContent = (
    <div className="space-y-6 flex-1">
      {/* Sort By */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Sort By</h3>
        <div className="space-y-2">
          {[
            { label: "Newest Arrivals", value: "newest" },
            { label: "Popularity", value: "popular" },
            { label: "Price: Low to High", value: "price_asc" },
            { label: "Price: High to Low", value: "price_desc" },
            { label: "Top Rated", value: "rating" },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${sortBy === option.value
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-gray-300 group-hover:border-gray-400"
                  }`}
              >
                {sortBy === option.value && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={sortBy === option.value}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="hidden"
              />
              <span
                className={`text-sm ${sortBy === option.value
                  ? "text-gray-900 font-medium"
                  : "text-gray-600 group-hover:text-gray-900"
                  }`}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Occasion Filter */}
      {occasions.length > 0 && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Occasion</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedOccasion === null
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-gray-300"
                  }`}
              >
                {selectedOccasion === null && <Check className="w-3 h-3" />}
              </div>
              <input
                type="radio"
                name="occasion"
                checked={selectedOccasion === null}
                onChange={() => {
                  setSelectedOccasion(null);
                  setCurrentPage(1);
                }}
                className="hidden"
              />
              <span
                className={`text-sm ${selectedOccasion === null
                  ? "text-gray-900 font-medium"
                  : "text-gray-600 group-hover:text-gray-900"
                  }`}
              >
                Any Occasion
              </span>
            </label>
            {occasions.map((occasion) => (
              <label key={occasion.id} className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedOccasion === occasion.slug
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-gray-300"
                    }`}
                >
                  {selectedOccasion === occasion.slug && <Check className="w-3 h-3" />}
                </div>
                <input
                  type="radio"
                  name="occasion"
                  value={occasion.slug}
                  checked={selectedOccasion === occasion.slug}
                  onChange={() => {
                    setSelectedOccasion(occasion.slug);
                    setCurrentPage(1);
                  }}
                  className="hidden"
                />
                <span
                  className={`text-sm ${selectedOccasion === occasion.slug
                    ? "text-gray-900 font-medium"
                    : "text-gray-600 group-hover:text-gray-900"
                    }`}
                >
                  {occasion.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => {
                setPriceRange({ ...priceRange, min: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
            />
          </div>
          <span className="text-gray-400">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => {
                setPriceRange({ ...priceRange, max: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minRating === rating
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-gray-300"
                  }`}
              >
                {minRating === rating && <Check className="w-3 h-3" />}
              </div>
              <input
                type="radio"
                name="rating"
                checked={minRating === rating}
                onChange={() => {
                  setMinRating(minRating === rating ? null : rating);
                  setCurrentPage(1);
                }}
                className="hidden"
              />
              <div className="flex items-center gap-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rating ? "fill-current" : "text-gray-200"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">& Up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${gradientClass} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>
        <div className="w-full px-4 md:px-8 py-10 md:py-16 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium capitalize">{pageTitle}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight capitalize">
            {pageTitle}
          </h1>
          <p className="mt-3 text-white/70 text-sm md:text-base max-w-xl">{pageDescription}</p>
          {isGenderPage && (
            <div className="mt-4 flex gap-3">
              <Link
                href="/categories/male"
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${genderKey === "male"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "bg-white/15 text-white hover:bg-white/25 backdrop-blur"
                  }`}
              >
                Men
              </Link>
              <Link
                href="/categories/female"
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${genderKey === "female"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "bg-white/15 text-white hover:bg-white/25 backdrop-blur"
                  }`}
              >
                Women
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      {isGenderPage && (
        <section className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
          <div className="w-full px-4 md:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-3 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              <button
                onClick={() => handleCategorySelect(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${selectedCategory === null
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                Shop All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${selectedCategory === cat.slug
                    ? "bg-gray-900 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="w-full px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-gray-700 shadow-sm hover:shadow transition-shadow"
            >
              <Filter className="w-4 h-4" /> Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-medium text-gray-900 focus:outline-none text-sm"
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="price_asc">Price: Low</option>
                <option value="price_desc">Price: High</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          <aside
            className={`
              fixed inset-0 z-50 transform transition-transform duration-300 bg-black/50 lg:hidden
              ${isFilterOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <div className="h-full w-4/5 max-w-xs bg-white p-6 shadow-2xl overflow-y-auto flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 text-gray-500 hover:text-black rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {filterContent}
            </div>
            <div className="flex-1" onClick={() => setIsFilterOpen(false)} />
          </aside>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            {filterContent}
          </aside>

          {/* Products Area */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isFetching && !isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    `${totalProducts} Product${totalProducts !== 1 ? "s" : ""} Found`
                  )}
                </h2>
                {selectedCategory && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    in <span className="font-medium text-gray-700 capitalize">{selectedCategory.replace(/-/g, " ")}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4" />
                <p className="text-gray-400">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg mb-2">No products found.</p>
                <p className="text-gray-400 text-sm mb-6">
                  Try adjusting your filters or browsing a different category.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-full text-white bg-gray-900 hover:bg-gray-800 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-10">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={isFetching}
                  />
                </div>

                {/* Results info */}
                {pagination && (
                  <div className="mt-4 text-center text-sm text-gray-400">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} of {totalProducts} products
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
        </div>
      }
    >
      <GenderPageContent />
    </Suspense>
  );
}

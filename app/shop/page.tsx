"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Star, Filter, X, ChevronDown, Check } from "lucide-react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

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
    rentalCount: number;
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

export default function ShopPage() {
    // Applied filter state (what actually triggers the query)
    const [appliedFilters, setAppliedFilters] = useState({
        category: null as string | null,
        occasion: null as string | null,
        priceRange: { min: "", max: "" },
        minRating: null as number | null,
        sortBy: "newest",
        page: 1
    });

    // Pending filter state (UI state)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
    const [minRating, setMinRating] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<string>("newest");

    // Mobile filter state
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Fetch Categories
    const { data: categories = [], isLoading: catLoading } = useQuery<Category[]>({
        queryKey: ['shop-categories'],
        queryFn: async () => {
            const res = await fetch("/api/categories");
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            return data.categories || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    // Fetch Occasions
    const { data: occasions = [] } = useQuery<Occasion[]>({
        queryKey: ['occasions'],
        queryFn: async () => {
            const res = await fetch('/api/occasions?active=true');
            if (!res.ok) throw new Error('Failed to fetch occasions');
            const data = await res.json();
            return data.occasions;
        },
        staleTime: 10 * 60 * 1000,
    });

    // Fetch Products (Infinite Query)
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery<ProductResponse>({
        queryKey: ['shop-products', appliedFilters],
        queryFn: async ({ pageParam = 1 }: { pageParam: unknown }) => {
            const page = typeof pageParam === 'number' ? pageParam : 1;
            const params = new URLSearchParams();
            if (appliedFilters.category) params.append("category", appliedFilters.category);
            if (appliedFilters.occasion) params.append("occasion", appliedFilters.occasion);
            if (appliedFilters.priceRange.min) params.append("minPrice", appliedFilters.priceRange.min);
            if (appliedFilters.priceRange.max) params.append("maxPrice", appliedFilters.priceRange.max);
            if (appliedFilters.minRating) params.append("minRating", appliedFilters.minRating.toString());
            params.append("sort", appliedFilters.sortBy);
            params.append("page", page.toString());
            params.append("limit", "12");

            const res = await fetch(`/api/products?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch products');
            return await res.json();
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.page < lastPage.pagination.totalPages) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000,
    });

    const products = data?.pages.flatMap(page => page.products) || [];
    const totalProducts = data?.pages[0]?.pagination.total || 0;

    // Intersection Observer for Infinite Scroll
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const loading = status === 'pending' || catLoading;

    const applyFilters = () => {
        setAppliedFilters({
            category: selectedCategory,
            occasion: selectedOccasion,
            priceRange: { ...priceRange },
            minRating,
            sortBy,
            page: 1 // Reset to page 1 on filter apply
        });
        setIsFilterOpen(false); // Close mobile drawer on apply
    };

    const clearFilters = () => {
        // Reset UI state
        setSelectedCategory(null);
        setSelectedOccasion(null);
        setPriceRange({ min: "", max: "" });
        setMinRating(null);
        setSortBy("newest");

        // Reset Applied state
        setAppliedFilters({
            category: null,
            occasion: null,
            priceRange: { min: "", max: "" },
            minRating: null,
            sortBy: "newest",
            page: 1
        });
    };

    const handleCategoryClick = (slug: string | null) => {
        setSelectedCategory(slug);
        setAppliedFilters(prev => ({ ...prev, category: slug, page: 1 }));
    };

    // Error state
    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-red-500 mb-2">Error loading products.</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-black text-white rounded-lg"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Initial loading state (only for first fetch)
    if (status === 'pending') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Categories Section - Circular (Horizontal Scroll on Mobile) */}
                <section aria-labelledby="shop-categories" className="mb-10 overflow-x-auto pt-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex justify-start md:justify-center gap-6 md:gap-8 min-w-max md:min-w-0">
                        <button
                            onClick={() => handleCategoryClick(null)}
                            className={`group flex flex-col items-center gap-3 transition-all ${selectedCategory === null ? 'scale-110' : 'hover:scale-105'}`}
                        >
                            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 flex items-center justify-center bg-gray-100 ${selectedCategory === null ? 'border-primary' : 'border-transparent group-hover:border-gray-300'}`}>
                                <span className="text-sm font-bold text-gray-500">ALL</span>
                            </div>
                            <span className={`text-sm font-bold ${selectedCategory === null ? 'text-primary' : 'text-gray-700'}`}>View All</span>
                        </button>

                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.slug)}
                                className={`group flex flex-col items-center gap-3 transition-all ${selectedCategory === category.slug ? 'scale-110' : 'hover:scale-105'}`}
                            >
                                <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 shadow-sm ${selectedCategory === category.slug ? 'border-primary' : 'border-white group-hover:border-gray-300'}`}>
                                    {category.image ? (
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                    )}
                                </div>
                                <span className={`text-sm font-bold ${selectedCategory === category.slug ? 'text-primary' : 'text-gray-700'}`}>{category.name}</span>
                            </button>
                        ))}
                    </div>
                </section>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden flex justify-between items-center mb-4">
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium text-gray-700 shadow-sm"
                        >
                            <Filter className="w-4 h-4" /> Filters
                        </button>
                        <div className="flex items-center gap-2">
                            {/* Mobile sort directly modifies state to view feedback in dropdown, but apply needed */}
                            {/* Or better, make it modify pending state */}
                            <span className="text-sm text-gray-500">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    // Optionally auto-apply sort on mobile dropdown change for immediate feedback if desired,
                                    // but consistency says maintain "Apply" logic. 
                                    // User asked to STOP loading server every time, so manual apply is preferred.
                                }}
                                className="bg-transparent font-medium text-gray-900 focus:outline-none max-w-[120px]"
                            >
                                <option value="newest">Newest</option>
                                <option value="popular">Popular</option>
                                <option value="price_asc">Price: Low</option>
                                <option value="price_desc">Price: High</option>
                                <option value="rating">Top Rated</option>
                            </select>
                        </div>
                    </div>

                    {/* Sidebar Filters */}
                    <aside className={`
                        fixed inset-0 z-50 transform transition-transform duration-300 bg-black/50 lg:static lg:bg-transparent lg:z-auto lg:transform-none lg:w-64 lg:block
                        ${isFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <div className={`
                            h-full w-4/5 max-w-xs bg-white lg:bg-transparent p-6 lg:p-0 shadow-2xl lg:shadow-none overflow-y-auto lg:overflow-visible flex flex-col
                        `}>
                            <div className="flex justify-between items-center lg:hidden mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                                <button onClick={() => setIsFilterOpen(false)} className="p-2 text-gray-500 hover:text-black">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-8 flex-1">
                                {/* Sort By (Desktop) */}
                                <div className="hidden lg:block bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                                        Sort By
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Newest Arrivals', value: 'newest' },
                                            { label: 'Popularity', value: 'popular' },
                                            { label: 'Price: Low to High', value: 'price_asc' },
                                            { label: 'Price: High to Low', value: 'price_desc' },
                                            { label: 'Top Rated', value: 'rating' },
                                        ].map((option) => (
                                            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${sortBy === option.value ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                                                    {sortBy === option.value && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="sort"
                                                    value={option.value}
                                                    checked={sortBy === option.value}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                    className="hidden"
                                                />
                                                <span className={`text-sm ${sortBy === option.value ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Occasion Filter */}
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4">Occasion</h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedOccasion === null ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                                                {selectedOccasion === null && <Check className="w-3 h-3" />}
                                            </div>
                                            <input
                                                type="radio"
                                                name="occasion"
                                                checked={selectedOccasion === null}
                                                onChange={() => setSelectedOccasion(null)}
                                                className="hidden"
                                            />
                                            <span className={`text-sm ${selectedOccasion === null ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>Any Occasion</span>
                                        </label>
                                        {occasions.map((occasion) => (
                                            <label key={occasion.id} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedOccasion === occasion.slug ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                                                    {selectedOccasion === occasion.slug && <Check className="w-3 h-3" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="occasion"
                                                    value={occasion.slug}
                                                    checked={selectedOccasion === occasion.slug}
                                                    onChange={() => setSelectedOccasion(occasion.slug)}
                                                    className="hidden"
                                                />
                                                <span className={`text-sm ${selectedOccasion === occasion.slug ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>{occasion.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={priceRange.min}
                                                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                                className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            />
                                        </div>
                                        <span className="text-gray-400">-</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={priceRange.max}
                                                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                                className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4">Rating</h3>
                                    <div className="space-y-2">
                                        {[4, 3, 2, 1].map((rating) => (
                                            <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${minRating === rating ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                                                    {minRating === rating && <Check className="w-3 h-3" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="rating"
                                                    checked={minRating === rating}
                                                    onChange={() => setMinRating(minRating === rating ? null : rating)} // Toggle
                                                    className="hidden"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <div className="flex text-amber-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-current' : 'text-gray-200'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-500">& Up</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Apply Button (Desktop & Mobile) */}
                                <button
                                    onClick={applyFilters}
                                    className="w-full py-3 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-xl transition-colors shadow-md"
                                >
                                    Apply Filters
                                </button>

                                {/* Clear Filters Button */}
                                {(selectedCategory !== null || selectedOccasion !== null || priceRange.min !== "" || priceRange.max !== "" || minRating !== null || sortBy !== "newest") && (
                                    <button
                                        onClick={clearFilters}
                                        className="w-full py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Overlay for mobile to close sidebar */}
                        <div className="flex-1 lg:hidden" onClick={() => setIsFilterOpen(false)}></div>
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-6">
                            <h2 id="shop-products" className="text-xl font-bold text-gray-900">
                                {products.length > 0 ? `${totalProducts} Products Found` : 'No Products'}
                            </h2>
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500 text-lg mb-2">No products match your filters.</p>
                                <p className="text-gray-400 text-sm mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-gray-900 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                                    {products.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.id}`}
                                            className="group bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
                                        >
                                            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                />
                                                <div className="absolute top-2 left-2">
                                                    {product.rating >= 4.5 && (
                                                        <span className="bg-white/90 backdrop-blur text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full shadow-sm flex items-center gap-1">
                                                            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-amber-400 text-amber-400" />
                                                            {product.rating.toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-2 md:p-4 flex flex-col flex-1">
                                                <div className="text-[10px] md:text-xs text-gray-500 mb-1">{product.category?.name}</div>
                                                <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                                <div className="mt-auto pt-2 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] md:text-xs text-gray-400 line-through">₹{Math.round(product.dailyPrice * 1.2)}</p>
                                                        <p className="font-black text-sm md:text-lg text-gray-900">₹{product.dailyPrice}<span className="text-[10px] md:text-xs font-normal text-gray-500">/day</span></p>
                                                    </div>
                                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                                        <span className="material-symbols-outlined text-sm md:text-lg">arrow_forward</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Loading Indicator / Infinite Scroll Trigger */}
                                {hasNextPage && (
                                    <div ref={ref} className="mt-8 flex justify-center p-4">
                                        {isFetchingNextPage ? (
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Scroll for more...</span>
                                        )}
                                    </div>
                                )}

                                {!hasNextPage && products.length > 0 && (
                                    <div className="mt-12 text-center text-gray-400 text-sm pb-8">
                                        You've reached the end of the list
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

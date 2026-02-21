"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/product/product-card";
import { Filter, ChevronDown, Check, X, ArrowUpDown, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
    image: string | null;
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
    const [openSection, setOpenSection] = useState<string | null>(null);

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

    // Fetch Products (Standard Query with Pagination)
    const { data, isLoading: prodLoading } = useQuery<ProductResponse>({
        queryKey: ['shop-products', appliedFilters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (appliedFilters.category) params.append("category", appliedFilters.category);
            if (appliedFilters.occasion) params.append("occasion", appliedFilters.occasion);
            if (appliedFilters.priceRange.min) params.append("minPrice", appliedFilters.priceRange.min);
            if (appliedFilters.priceRange.max) params.append("maxPrice", appliedFilters.priceRange.max);
            if (appliedFilters.minRating) params.append("minRating", appliedFilters.minRating?.toString() || "");
            params.append("sort", appliedFilters.sortBy);
            params.append("page", appliedFilters.page.toString());
            params.append("limit", "15"); // 5 cols x 3 rows

            const res = await fetch(`/api/products?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch products');
            return await res.json();
        },
        placeholderData: (previousData) => previousData,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const products = data?.products || [];
    const totalProducts = data?.pagination?.total || 0;
    const totalPages = data?.pagination?.totalPages || 1;
    const currentPage = data?.pagination?.page || 1;


    const activeFiltersCount = () => {
        let count = 0;
        if (selectedOccasion) count++;
        if (selectedCategory) count++;
        if (priceRange.min || priceRange.max) count++;
        if (minRating) count++;
        if (sortBy !== "newest") count++;
        return count;
    };

    const applyFilters = () => {
        setAppliedFilters({
            category: selectedCategory,
            occasion: selectedOccasion,
            priceRange: { ...priceRange },
            minRating,
            sortBy,
            page: 1
        });
        setIsFilterOpen(false);
    };

    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedOccasion(null);
        setPriceRange({ min: "", max: "" });
        setMinRating(null);
        setSortBy("newest");
        setAppliedFilters({
            category: null,
            occasion: null,
            priceRange: { min: "", max: "" },
            minRating: null,
            sortBy: "newest",
            page: 1
        });
    };

    const handleOccasionClick = (slug: string | null) => {
        setSelectedOccasion(slug);
        setAppliedFilters(prev => ({ ...prev, occasion: slug, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setAppliedFilters(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (prodLoading && !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-12 relative font-sans">
            <div className="w-full px-2 md:px-6">

                {/* Breadcrumbs */}
                <nav className="py-6 text-sm text-gray-400 flex items-center gap-2">
                    <Link href="/" className="hover:text-black transition-colors">Home</Link>
                    <span>›</span>
                    <span className="text-gray-900 font-medium">Shop</span>
                </nav>

                {/* Filter & Sort Bar */}
                <div className="flex items-center justify-between py-6 border-t border-gray-100 mb-6 md:mb-8 mt-2">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 text-[15px] md:text-base font-medium text-gray-700 hover:text-black transition-colors cursor-pointer"
                    >
                        <Filter className="w-5 h-5 text-gray-400" />
                        <span className="md:hidden">Filter and sort</span>
                        <span className="hidden md:inline">Filter</span>
                    </button>

                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="hidden md:flex items-center gap-2 text-xs md:text-sm">
                            <span className="text-gray-400">Sort by:</span>
                            <div className="relative group">
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        setAppliedFilters(prev => ({ ...prev, sortBy: e.target.value, page: 1 }));
                                    }}
                                    className="appearance-none bg-transparent font-medium text-gray-900 pr-5 focus:outline-none cursor-pointer"
                                >
                                    <option value="newest">Featured</option>
                                    <option value="popular">Best Selling</option>
                                    <option value="price_asc">Price: Low</option>
                                    <option value="price_desc">Price: High</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                                <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                            </div>
                        </div>
                        <span className="text-[13px] md:text-sm text-gray-400 font-normal">{totalProducts} products</span>
                    </div>
                </div>

                {/* Mobile Filters Drawer */}
                <aside className={`
                    fixed inset-0 z-[100] transform transition-transform duration-300
                    ${isFilterOpen ? 'translate-x-0' : 'translate-x-[100%]'}
                `}>
                    <div className="flex flex-col h-full bg-white md:max-w-md md:ml-auto md:shadow-2xl">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            {openSection ? (
                                <button onClick={() => setOpenSection(null)} className="p-2 -ml-2 text-gray-500 hover:text-black">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            ) : (
                                <div className="w-10" /> // Spacer
                            )}

                            <div className="text-center">
                                <h2 className="text-[17px] font-semibold text-gray-900">
                                    {openSection === 'category' ? 'Category' :
                                        openSection === 'occasion' ? 'Occasion' :
                                            openSection === 'price' ? 'Price' :
                                                openSection === 'sort' ? 'Sort by' : 'Filter and sort'}
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">{totalProducts} products</p>
                            </div>

                            <button onClick={() => setIsFilterOpen(false)} className="p-2 -mr-2 text-gray-500 hover:text-black">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {!openSection ? (
                                // Main Menu
                                <div className="divide-y divide-gray-100">
                                    {/* Category */}
                                    <button
                                        onClick={() => setOpenSection('category')}
                                        className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-[16px] text-gray-700 font-normal">Category</span>
                                        <div className="flex items-center gap-3">
                                            {selectedCategory && (
                                                <span className="text-sm text-gray-500">{selectedCategory}</span>
                                            )}
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </button>

                                    {/* Occasion */}
                                    <button
                                        onClick={() => setOpenSection('occasion')}
                                        className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-[16px] text-gray-700 font-normal">Occasion</span>
                                        <div className="flex items-center gap-3">
                                            {selectedOccasion && (
                                                <span className="text-sm text-gray-500 capitalize">{selectedOccasion.replace(/-/g, ' ')}</span>
                                            )}
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </button>

                                    {/* Price */}
                                    <button
                                        onClick={() => setOpenSection('price')}
                                        className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-[16px] text-gray-700 font-normal">Price</span>
                                        <div className="flex items-center gap-3">
                                            {(priceRange.min || priceRange.max) && (
                                                <span className="text-sm text-gray-500">
                                                    {priceRange.min ? `₹${priceRange.min}` : '₹0'} - {priceRange.max ? `₹${priceRange.max}` : 'Any'}
                                                </span>
                                            )}
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </button>

                                    {/* Sort By */}
                                    <button
                                        onClick={() => setOpenSection('sort')}
                                        className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-[16px] text-gray-700 font-normal">Sort by</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-500">
                                                {sortBy === 'newest' ? 'Featured' :
                                                    sortBy === 'popular' ? 'Best Selling' :
                                                        sortBy === 'price_asc' ? 'Price: Low' :
                                                            sortBy === 'price_desc' ? 'Price: High' :
                                                                sortBy === 'rating' ? 'Top Rated' : 'Featured'}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </button>
                                </div>
                            ) : (
                                // Sub-sections
                                <div className="p-6">
                                    {openSection === 'category' && (
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => setSelectedCategory(null)}
                                                className={`w-full flex items-center gap-3 px-2 py-3 rounded-lg ${selectedCategory === null ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedCategory === null ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
                                                    {selectedCategory === null && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="text-gray-900">All Categories</span>
                                            </button>

                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setSelectedCategory(cat.name)}
                                                    className={`w-full flex items-center gap-3 px-2 py-3 rounded-lg ${selectedCategory === cat.name ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedCategory === cat.name ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
                                                        {selectedCategory === cat.name && <Check className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="text-gray-900">{cat.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {openSection === 'occasion' && (
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => setSelectedOccasion(null)}
                                                className={`w-full flex items-center gap-3 px-2 py-3 rounded-lg ${selectedOccasion === null ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'}`}
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedOccasion === null ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
                                                    {selectedOccasion === null && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="text-gray-900">All Occasions</span>
                                            </button>

                                            {occasions.map((occasion) => (
                                                <button
                                                    key={occasion.id}
                                                    onClick={() => setSelectedOccasion(occasion.slug)}
                                                    className={`w-full flex items-center gap-3 px-2 py-3 rounded-lg ${selectedOccasion === occasion.slug ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedOccasion === occasion.slug ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
                                                        {selectedOccasion === occasion.slug && <Check className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="text-gray-900">{occasion.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {openSection === 'price' && (
                                        <div className="space-y-1">
                                            {[
                                                { label: 'Under ₹500', min: '0', max: '500' },
                                                { label: '₹500 - ₹1,000', min: '500', max: '1000' },
                                                { label: '₹1,000 - ₹5,000', min: '1000', max: '5000' },
                                                { label: '₹5,000 - ₹10,000', min: '5000', max: '10000' },
                                                { label: 'Above ₹10,000', min: '10000', max: '' },
                                            ].map((range) => {
                                                const isActive = priceRange.min === range.min && priceRange.max === range.max;
                                                return (
                                                    <button
                                                        key={range.label}
                                                        onClick={() => {
                                                            if (isActive) {
                                                                setPriceRange({ min: '', max: '' });
                                                            } else {
                                                                setPriceRange({ min: range.min, max: range.max });
                                                            }
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-2 py-3 rounded-lg ${isActive ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${isActive ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
                                                            {isActive && <Check className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <span className="text-gray-900">{range.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {openSection === 'sort' && (
                                        <div className="space-y-1">
                                            {[
                                                { value: 'newest', label: 'Featured' },
                                                { value: 'popular', label: 'Best Selling' },
                                                { value: 'price_asc', label: 'Price: Low to High' },
                                                { value: 'price_desc', label: 'Price: High to Low' },
                                                { value: 'rating', label: 'Top Rated' },
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setSortBy(option.value)}
                                                    className={`w-full flex items-center gap-3 px-2 py-3 rounded-lg ${sortBy === option.value ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${sortBy === option.value ? 'border-2 border-black' : 'border-gray-300'}`}>
                                                        {sortBy === option.value && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                                                    </div>
                                                    <span className="text-gray-900">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-white gap-4">
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3 text-[15px] font-medium text-gray-500 hover:text-black transition-colors underline underline-offset-4"
                            >
                                Remove all
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-1 py-3 text-[15px] font-bold text-white bg-black hover:bg-gray-900 rounded-full transition-all shadow-lg active:scale-95"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Products Grid */}
                <main className="min-w-0">
                    {products.length === 0 ? (
                        <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <p className="text-gray-400 font-medium font-serif italic text-lg">No products match your criteria.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-1 md:gap-x-6 gap-y-10 md:gap-y-12">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {products.length > 0 && (
                                <div className="mt-12 mb-20 flex justify-center items-center gap-2 relative z-20">
                                    <button
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-black hover:text-black disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
                                                ${currentPage === page
                                                    ? 'bg-black text-white shadow-lg scale-110'
                                                    : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages || totalPages <= 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-black hover:text-black disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>


            {/* WhatsApp Floating Button */}
        </div>
    );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Star, Grid, List, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

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
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['category-products', slug],
    queryFn: async ({ pageParam = 1 }: { pageParam: unknown }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const res = await fetch(`/api/products?category=${slug}&limit=12&page=${page}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return await res.json();
    },
    getNextPageParam: (lastPage: any) => {
      if (lastPage.pagination && lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.pages.flatMap((page: any) => page.products as Product[]) || [];
  const totalProducts = data?.pages[0]?.pagination?.total || 0;

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Error loading products.</p>
        <Link href="/categories" className="text-blue-500 underline">Back to Categories</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/shop" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" /> Back to Shop
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-white capitalize">{slug}</h1>
          <p className="mt-2 text-rose-100">Find the perfect outfit for your event</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-6 hidden lg:block" aria-label="Filters">
            {/* Size Filter */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Size</h2>
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <button
                    key={size}
                    className="px-3 py-1 border rounded-md text-sm hover:border-rose-500 hover:text-rose-500 transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Price Range</h2>
              <div className="space-y-2">
                {['Under ₹50', '₹50 - ₹100', '₹100 - ₹200', 'Over ₹200'].map((range) => (
                  <label key={range} className="flex items-center cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-rose-500 focus:ring-rose-500" />
                    <span className="ml-2 text-sm text-gray-700">{range}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Sort & View */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 font-medium">{totalProducts} products found</p>
              <div className="flex items-center space-x-4">
                <select className="border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500 shadow-sm" aria-label="Sort products">
                  <option>Sort by: Popular</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Top Rated</option>
                </select>
                <div className="flex border border-gray-300 rounded-md bg-white overflow-hidden" role="group" aria-label="View mode">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-rose-500' : 'hover:bg-gray-50 text-gray-500'}`}
                    aria-label="Grid view"
                    aria-pressed={viewMode === 'grid'}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-rose-500' : 'hover:bg-gray-50 text-gray-500'}`}
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-500 text-lg mb-4">No products found in this category.</p>
                <Link href="/shop" className="text-white bg-rose-500 px-6 py-2 rounded-full hover:bg-rose-600 transition-colors inline-block font-medium">
                  Browse All Products
                </Link>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {products.map((product, index) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col overflow-hidden border border-gray-100"
                    >
                      <div className={`relative bg-gray-100 overflow-hidden ${viewMode === 'grid' ? 'aspect-[3/4]' : 'aspect-video w-full sm:w-1/3 sm:aspect-auto'}`}>
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={index < 4}
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2">
                          {product.rating >= 4.5 && (
                            <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {product.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <p className="text-xs text-gray-500 mb-1">{product.vendor?.businessName || 'Brand'}</p>
                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-rose-500 transition-colors mb-1">{product.name}</h3>

                        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
                          <div>
                            <p className="text-xs text-gray-400 line-through">₹{Math.round(product.dailyPrice * 1.2)}</p>
                            <p className="font-bold text-lg text-gray-900">₹{product.dailyPrice}<span className="text-xs font-normal text-gray-500">/day</span></p>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                {hasNextPage && (
                  <div ref={ref} className="mt-10 flex justify-center py-4">
                    {isFetchingNextPage ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                    ) : (
                      <span className="text-gray-400 text-sm">Loading more...</span>
                    )}
                  </div>
                )}

                {!hasNextPage && products.length > 0 && (
                  <div className="mt-12 text-center text-gray-400 text-sm pb-8 border-t pt-8">
                    You've reached the end
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

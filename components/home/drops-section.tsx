"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useQuery } from '@tanstack/react-query';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface DropProduct {
    id: string;
    name: string;
    image: string;
    price: number;
    brand?: string;
    slug?: string;
}

interface APIProduct {
    id: string;
    name: string;
    images: string[];
    dailyPrice: number;
    brand?: { name: string } | null;
    slug: string;
}

export function DropsSection() {
    const { data: products = [] } = useQuery<DropProduct[]>({
        queryKey: ['drops-products'],
        queryFn: async () => {
            const res = await fetch('/api/products?featured=true&limit=12');
            if (!res.ok) throw new Error('Failed to fetch products');
            const data = await res.json();
            if (data.products && data.products.length > 0) {
                const transformedProducts: DropProduct[] = data.products.map((p: APIProduct) => ({
                    id: p.id,
                    name: p.name,
                    image: p.images && p.images[0] ? p.images[0] : '',
                    price: p.dailyPrice,
                    brand: p.brand?.name || '',
                    slug: p.slug
                }));
                // Duplicate for smoother infinite loop
                return [...transformedProducts, ...transformedProducts];
            }
            return [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center',
        containScroll: false,
    }, [Autoplay({ delay: 3000, stopOnInteraction: false })]);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    // Use database products only
    const activeProduct = products.length > 0 ? products[selectedIndex] || products[0] : null;

    // Show loading or placeholder when no products
    if (!activeProduct) {
        return (
            <section className="py-20 relative overflow-hidden bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="relative inline-block">
                            <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter"
                                style={{
                                    WebkitTextStroke: '2px #000',
                                    textShadow: '4px 4px 0px rgba(0,0,0,0.1)'
                                }}>
                                DROPS
                            </h2>
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl md:text-6xl font-script text-black rotate-[-10deg]"
                                style={{ fontFamily: 'cursive' }}>
                                culture
                            </span>
                        </div>
                        <p className="text-black font-medium mt-4 tracking-wide text-sm md:text-base">
                            Loading products...
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // Helper to calculate distance from active slide handling loop
    const getSlideStyle = (index: number) => {
        const total = products.length;
        let diff = Math.abs(index - selectedIndex);
        if (diff > total / 2) {
            diff = total - diff;
        }

        // 3D Transform logic for smoother z-sorting
        // Center: High Z, Scale Up
        // Neighbors: Mid Z, Scale Down
        // Far: Low Z, Scale Further Down
        if (diff === 0) {
            return {
                transform: 'translateZ(200px) scale(1)',
                opacity: 1,
                filter: 'blur(0px)',
                zIndex: 20
            };
        } else if (diff === 1) {
            return {
                transform: 'translateZ(100px) scale(0.8)',
                opacity: 0.8,
                filter: 'blur(0.5px)',
                zIndex: 10
            };
        } else {
            return {
                transform: 'translateZ(0px) scale(0.6)',
                opacity: 0.5,
                filter: 'blur(2px)',
                zIndex: 0
            };
        }
    };

    return (
        <section className="py-20 relative overflow-hidden bg-white">
            {/* Perspective Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) scale(2)',
                    transformOrigin: 'top center'
                }}
            ></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="relative inline-block">
                        <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter"
                            style={{
                                WebkitTextStroke: '2px #000',
                                textShadow: '4px 4px 0px rgba(0,0,0,0.1)'
                            }}>
                            DROPS
                        </h2>
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl md:text-6xl font-script text-black rotate-[-10deg]"
                            style={{ fontFamily: 'cursive' }}>
                            culture
                        </span>
                    </div>
                    <p className="text-black font-medium mt-4 tracking-wide text-sm md:text-base">
                        Hottest Drip From Around The World. Refreshed Daily.
                    </p>
                </div>

                {/* 3D Carousel */}
                <div className="relative max-w-[1400px] mx-auto mb-2 -mx-4 md:mx-auto">
                    <div className="overflow-hidden pt-32 pb-20" ref={emblaRef} style={{ perspective: '1000px' }}>
                        <div className="flex items-center" style={{ transformStyle: 'preserve-3d' }}>
                            {products.map((product, index) => {
                                const slideStyle = getSlideStyle(index);
                                const isActive = index === selectedIndex;

                                return (
                                    <Link
                                        href={`/product/${product.slug || product.id}`}
                                        key={`${product.id}-${index}`}
                                        prefetch={false}
                                        className="flex-[0_0_70%] md:flex-[0_0_33.33%] lg:flex-[0_0_20%] min-w-0 relative group cursor-pointer px-2"
                                        style={{
                                            perspective: '1000px',
                                            zIndex: slideStyle.zIndex
                                        }}
                                        onClick={(e) => {
                                            if (!isActive) {
                                                e.preventDefault();
                                                emblaApi?.scrollTo(index);
                                            }
                                        }}>
                                        <div
                                            className="transition-all duration-500 ease-out transform-gpu origin-bottom"
                                            style={{ ...slideStyle, zIndex: 'auto' }}
                                        >
                                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-white">
                                                {/* Image Container */}
                                                <div className="w-full h-full">
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        sizes="(max-width: 768px) 70vw, (max-width: 1024px) 33vw, 20vw"
                                                        priority={index < 5}
                                                        fetchPriority={index < 2 ? "high" : "auto"}
                                                        loading={index < 5 ? "eager" : "lazy"}
                                                        className="object-cover object-top"
                                                    />
                                                </div>
                                            </div>

                                            {/* Shadow Effect */}
                                            <div className={`absolute -bottom-16 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 rounded-[100%] blur-md transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                                                }`}></div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation Arrows (Floating) */}
                    <button
                        onClick={scrollPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 border border-gray-200 bg-white rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors z-30 shadow-lg"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={scrollNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 border border-gray-200 bg-white rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors z-30 shadow-lg"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Product Details Card */}
                {activeProduct && (
                    <div className="max-w-sm mx-auto">
                        <div className="bg-white border border-gray-100 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] rounded-xl p-5 text-center relative overflow-hidden">
                            <div className="relative z-10 transition-all duration-300">
                                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                                    {activeProduct.name}
                                </h3>
                                <p className="text-2xl font-black text-gray-900 mb-4">
                                    ₹{activeProduct.price.toLocaleString('en-IN')}
                                </p>
                                <Link
                                    href={`/product/${activeProduct.slug || activeProduct.id}`}
                                    prefetch={false}
                                    className="block w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wider text-xs"
                                >
                                    Explore
                                </Link>
                            </div>
                        </div>

                        {/* Pagination Dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {products.map((_, idx) => (
                                <div key={idx}
                                    onClick={() => emblaApi?.scrollTo(idx)}
                                    className={`rounded-full transition-all duration-300 cursor-pointer ${idx === selectedIndex ? 'w-6 bg-black h-1' : 'w-1.5 h-1.5 bg-gray-300'}`}>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section >
    );
}

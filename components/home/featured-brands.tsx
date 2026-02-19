"use client";

import React, { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Brand {
    id: string;
    name: string;
    logo: string;
}

export function FeaturedBrands() {
    const { data: brands = [] } = useQuery<Brand[]>({
        queryKey: ['featured-brands'],
        queryFn: async () => {
            const res = await fetch('/api/brands?featured=true&active=true');
            if (!res.ok) throw new Error('Failed to fetch brands');
            const data = await res.json();
            return data.brands || [];
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const [emblaRef] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: true
    });

    return (
        <section className="pt-4 pb-12 bg-white">
            <div className="w-full px-4 md:px-6">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 uppercase tracking-widest text-left">
                        Shop From Brands
                    </h3>
                    <Link href="/brands" className="hidden md:flex items-center gap-2 text-xs font-semibold text-black hover:text-black transition-colors uppercase tracking-wider">
                        View all <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex -ml-4 md:-ml-8">
                        {brands.map((brand, index) => (
                            <div key={brand.id} className="flex-[0_0_auto] pl-4 md:pl-8">
                                <Link href={`/brand/${brand.name.toLowerCase()}`} prefetch={false} className="group flex flex-col items-center gap-3">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-gray-100 bg-white flex items-center justify-center p-4 shadow-sm group-hover:shadow-md group-hover:border-gray-300 transition-all duration-300 relative">
                                        <img
                                            src={brand.logo}
                                            alt={brand.name}
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                            className="absolute inset-0 w-full h-full object-contain p-4 filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                                        />
                                        <div className="absolute inset-0 items-center justify-center" style={{ display: 'none' }}>
                                            <span className="material-symbols-outlined text-3xl text-gray-400">storefront</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-black group-hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
                                        {brand.name}
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 md:hidden text-center">
                    <Link href="/brands" className="inline-flex items-center gap-2 text-sm font-medium text-gray-900">
                        View all brands <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

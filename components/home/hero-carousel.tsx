"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

interface Banner {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    link?: string;
    theme?: string;
}

function HeroSkeleton() {
    return (
        <div className="relative w-full aspect-[4/3] md:h-[calc(100vh-80px)] md:aspect-auto bg-gray-200 animate-pulse">
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                <div className="h-4 w-32 bg-gray-300 rounded mb-4"></div>
                <div className="h-12 w-64 bg-gray-300 rounded mb-6"></div>
                <div className="h-12 w-40 bg-gray-300 rounded-full"></div>
            </div>
        </div>
    );
}

export function HeroCarousel() {
    const { data: banners = [], isLoading: loading } = useQuery<Banner[]>({
        queryKey: ['hero-banners'],
        queryFn: async () => {
            const res = await fetch('/api/banners?position=home&active=true');
            if (!res.ok) throw new Error('Failed to fetch banners');
            const data = await res.json();
            return data.banners || [];
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

    const handleImageLoad = (id: string) => {
        setLoadedImages(prev => new Set(prev).add(id));
    };

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

    const scrollTo = useCallback((index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    if (loading) {
        return <HeroSkeleton />;
    }

    if (banners.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full overflow-hidden bg-gray-900 group">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {banners.map((slide) => (
                        <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 aspect-[4/3] md:aspect-auto md:h-[calc(100vh-80px)]">
                            {!loadedImages.has(slide.id) && (
                                <div className="absolute inset-0 bg-gray-800 animate-pulse" />
                            )}
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                priority={banners.indexOf(slide) === 0}
                                fetchPriority={banners.indexOf(slide) === 0 ? "high" : "auto"}
                                loading={banners.indexOf(slide) === 0 ? "eager" : "lazy"}
                                quality={90}
                                sizes="100vw"
                                onLoad={() => handleImageLoad(slide.id)}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loadedImages.has(slide.id) ? 'opacity-100' : 'opacity-0'
                                    }`}
                            />
                            {/* Overlay - adjusting opacity based on theme */}
                            <div className={`absolute inset-0 flex flex-col justify-center items-center text-center px-6 md:px-16 lg:px-24 ${slide.theme === 'red'
                                ? 'bg-red-900/40 mix-blend-multiply'
                                : 'bg-black/40'
                                }`}>
                            </div>
                            {/* Content Layer (separate from background blend mode) */}
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 z-10">
                                <span className="text-secondary font-bold tracking-[0.2em] uppercase mb-1 md:mb-4 text-[10px] md:text-sm animate-fade-in-up drop-shadow-md">
                                    {slide.subtitle}
                                </span>
                                <h2 className="text-white text-xl md:text-4xl lg:text-6xl font-black max-w-5xl leading-tight mb-2 md:mb-8 animate-fade-in-up delay-100 drop-shadow-lg uppercase px-2">
                                    {slide.title}
                                </h2>
                                {slide.link ? (
                                    <Link href={slide.link} prefetch={false} className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-4 py-2 md:px-8 md:py-4 rounded-full text-[10px] md:text-base transition-transform hover:scale-105 shadow-xl animate-fade-in-up delay-200">
                                        Shop Collection
                                    </Link>
                                ) : (
                                    <button className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-4 py-2 md:px-8 md:py-4 rounded-full text-[10px] md:text-base transition-transform hover:scale-105 shadow-xl animate-fade-in-up delay-200">
                                        Shop Collection
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hidden md:flex items-center justify-center hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hidden md:flex items-center justify-center hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer"
                aria-label="Next slide"
            >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 md:bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        className={`transition-all duration-300 rounded-full cursor-pointer ${index === selectedIndex
                            ? 'bg-white w-6 h-1.5 md:w-12 md:h-3'
                            : 'bg-white/40 w-1.5 h-1.5 md:w-3 md:h-3 hover:bg-white/60'
                            }`}
                        onClick={() => scrollTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

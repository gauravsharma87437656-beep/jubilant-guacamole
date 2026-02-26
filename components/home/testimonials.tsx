"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';

const testimonials = [
    {
        name: "Aarushi",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        content: "Artesia made my bridal look feel truly magical. The detailing, the fit, everything was perfect. I felt like the best version of myself on my big day.",
    },
    {
        name: "Priya Sharma",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        content: "Renting my wedding outfit was a breeze. Quality was premium and the service was beyond my expectations.",
    },
    {
        name: "Sneha Kapur",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
        content: "The best collection of designer wear! Saved so much while still looking like a million dollars.",
    }
];

export function Testimonials() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onSelect = useCallback((api: any) => {
        setSelectedIndex(api.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    return (
        <section className="py-12 md:py-24 bg-[#FCFBF8]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-serif text-gray-900 tracking-tight">Words Happy Customers</h2>
                </div>

                {/* Mobile: Carousel (below md) */}
                <div className="md:hidden">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="flex-[0_0_100%] min-w-0 px-2">
                                    <TestimonialCard testimonial={testimonial} isMobile={true} />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Dot Navigation for Mobile */}
                    <div className="flex justify-center gap-2 mt-8">
                        {scrollSnaps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={cn(
                                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                    index === selectedIndex ? "bg-rose-400 scale-110" : "bg-gray-200"
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop: 3-Column Grid (md and above) */}
                <div className="hidden md:grid md:grid-cols-3 gap-12">
                    {testimonials.map((testimonial, index) => (
                        <div key={index}>
                            <TestimonialCard testimonial={testimonial} isMobile={false} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TestimonialCard({ testimonial, isMobile }: { testimonial: any, isMobile: boolean }) {
    return (
        <div className="text-center flex flex-col items-center">
            {/* Feedback Content */}
            <p className={cn("text-gray-600 italic leading-relaxed px-2", isMobile ? "text-lg mb-6" : "text-[19px] mb-10")}>
                &quot;{testimonial.content}&quot;
            </p>

            {/* User Avatar & Name */}
            <div className={cn("flex items-center gap-3", isMobile ? "mb-4" : "mb-6")}>
                <div className={cn("rounded-full overflow-hidden relative border border-gray-100 shadow-sm", isMobile ? "w-10 h-10" : "w-12 h-12")}>
                    <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <span className={cn("text-gray-800 font-medium", isMobile ? "text-base" : "text-lg")}>— {testimonial.name}</span>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRecentlyViewed, RecentlyViewedItem } from "@/lib/recently-viewed";
import { useSession } from "next-auth/react";
import { ChevronRight } from "lucide-react";

export function RecentlyViewed() {
    const { data: session } = useSession();
    const [items, setItems] = useState<RecentlyViewedItem[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        setItems(getRecentlyViewed(session?.user?.id));
    }, [session?.user?.id]);

    const checkScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
        }
    }, []);

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (el) {
            el.addEventListener("scroll", checkScroll);
            return () => el.removeEventListener("scroll", checkScroll);
        }
    }, [items, checkScroll]);

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
    };

    // Only show if user has viewed at least 4 products
    if (items.length < 4) return null;

    const firstName = session?.user?.name?.split(" ")[0] || "Hey";

    return (
        <section className="py-3 md:py-6">
            <div className="px-3 md:px-8 max-w-7xl mx-auto">
                <div className="bg-[#e8e0f0] md:bg-[#e8eaf6] rounded-2xl md:rounded-3xl px-3 py-4 md:px-6 md:py-5 relative">
                    {/* Personalized Header */}
                    <h2 className="text-[15px] md:text-[20px] font-bold text-gray-900 mb-3 md:mb-4 px-1">
                        {firstName}, still looking for these?
                    </h2>

                    {/* Horizontal Scroll Row */}
                    <div className="relative">
                        <div
                            ref={scrollRef}
                            className="overflow-x-auto scrollbar-hide -mx-1 px-1"
                        >
                            <div className="flex gap-2.5 md:gap-4 min-w-max">
                                {items.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/product/${item.slug || item.id}`}
                                        className="flex-shrink-0 group"
                                    >
                                        <div className="w-[100px] md:w-[140px] flex flex-col">
                                            {/* Square thumbnail */}
                                            <div className="relative w-[100px] h-[100px] md:w-[140px] md:h-[140px] rounded-xl md:rounded-2xl overflow-hidden bg-white border border-white/80 group-hover:border-gray-300 transition-all group-hover:shadow-lg">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    sizes="(max-width: 768px) 100px, 140px"
                                                />
                                            </div>
                                            <p className="text-[11px] md:text-[13px] font-medium text-gray-800 mt-1.5 line-clamp-1 px-0.5">
                                                {item.name}
                                            </p>
                                            <p className="text-[10px] md:text-[12px] font-bold text-gray-600 px-0.5">
                                                ₹{item.dailyPrice.toLocaleString()}/day
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Desktop scroll arrow on right edge */}
                        {canScrollRight && (
                            <button
                                onClick={scrollRight}
                                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 items-center justify-center hover:bg-gray-50 transition-all z-10"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

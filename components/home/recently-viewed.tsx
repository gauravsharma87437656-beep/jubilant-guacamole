"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRecentlyViewed, RecentlyViewedItem } from "@/lib/recently-viewed";
import { useSession } from "next-auth/react";

export function RecentlyViewed() {
    const { data: session } = useSession();
    const [items, setItems] = useState<RecentlyViewedItem[]>([]);

    useEffect(() => {
        setItems(getRecentlyViewed(session?.user?.id));
    }, [session?.user?.id]);

    // Only show if user has viewed at least 4 products
    if (items.length < 4) return null;

    const firstName = session?.user?.name?.split(" ")[0] || "Hey";

    return (
        <section className="py-3 md:py-6">
            <div className="px-3 md:px-8 max-w-7xl mx-auto">
                <div className="bg-[#e8e0f0] md:bg-[#ede6f5] rounded-2xl md:rounded-3xl px-3 py-4 md:px-6 md:py-6">
                    {/* Personalized Header */}
                    <h2 className="text-[16px] md:text-[22px] font-bold text-gray-900 mb-3 md:mb-5 px-1">
                        {firstName}, still looking for these?
                    </h2>

                    {/* Horizontal Scroll Row */}
                    <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                        <div className="flex gap-2.5 md:gap-4 min-w-max">
                            {items.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/product/${item.slug || item.id}`}
                                    className="flex-shrink-0 group"
                                >
                                    <div className="w-[105px] md:w-[150px] flex flex-col">
                                        {/* Square thumbnail with rounded corners + subtle border */}
                                        <div className="relative w-[105px] h-[105px] md:w-[150px] md:h-[150px] rounded-xl md:rounded-2xl overflow-hidden bg-white border border-gray-200/60 group-hover:border-gray-300 transition-all group-hover:shadow-lg">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 768px) 105px, 150px"
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
                </div>
            </div>
        </section>
    );
}

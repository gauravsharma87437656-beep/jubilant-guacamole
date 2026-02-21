"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    slug?: string;
    images: string[];
    dailyPrice: number;
    rating?: number;
    deposit?: number;
    vendorId?: string;
    vendor?: {
        businessName: string;
    };
}

export function ProductCard({ product }: { product: Product }) {
    const { addItem, setCartOpen } = useCartStore();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to product page
        e.stopPropagation();

        addItem({
            productId: product.id,
            productName: product.name,
            productImage: product.images[0],
            productSlug: product.slug,
            dailyPrice: product.dailyPrice,
            depositAmount: product.deposit || 0,
            vendorId: product.vendorId || "unknown",
            vendorName: product.vendor?.businessName || "Unknown Vendor",
            rentalStart: null,
            rentalEnd: null,
        });

        toast.success("Added to cart");
        // setCartOpen(true); // Cart drawer disabled
    };

    return (
        <div className="group flex flex-col">
            {/* Product Image Card */}
            <div className="relative aspect-[1/1.85] md:aspect-[1/1.6] rounded-xl overflow-hidden bg-gray-50 mb-4 md:mb-5 block group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-shadow duration-500">
                <Link href={`/product/${product.slug || product.id}`} className="absolute inset-0 z-0">
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    />
                </Link>

                {/* Sale Badge */}
                <div className="absolute top-4 left-4 md:top-5 md:left-5 pointer-events-none z-10">
                    <span className="bg-[#8b0000] text-white text-[10px] md:text-xs font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full uppercase tracking-[0.15em] shadow-md">
                        Sale
                    </span>
                </div>

                {/* Cart Icon */}
                <button
                    onClick={handleAddToCart}
                    className="absolute bottom-4 right-4 md:bottom-5 md:right-5 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-black hover:text-white group/icon z-20 cursor-pointer"
                    aria-label="Add to cart"
                >
                    <span className="material-symbols-outlined text-gray-900 text-lg md:text-xl font-light group-hover/icon:text-white transition-colors">shopping_bag</span>
                </button>
            </div>

            {/* Product Info */}
            <div className="space-y-1.5 px-2 md:px-3">
                <Link href={`/product/${product.slug || product.id}`}>
                    <h3 className="text-[13px] md:text-[15px] font-medium text-gray-800 line-clamp-2 hover:text-black transition-colors leading-[1.4] tracking-tight">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex flex-col gap-0.5 md:gap-1">
                    <span className="text-[#8b0000] font-bold text-[13px] md:text-[17px]">
                        From Rs. {product.dailyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-gray-400 text-[10px] md:text-[13px] line-through font-normal">
                        Rs. {(product.dailyPrice * 1.5).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>
        </div>
    );
}

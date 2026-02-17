"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

interface MobileSearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    suggestions: any[];
    handleSearch: (e: React.FormEvent) => void;
}

export function MobileSearchOverlay({
    isOpen,
    onClose,
    searchQuery,
    setSearchQuery,
    suggestions,
    handleSearch,
}: MobileSearchOverlayProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Focus the input when the overlay opens
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);

            // Prevent body scroll when overlay is open
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white z-[100] md:hidden flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-200">
            {/* Search Header */}
            <div className="flex items-center p-4 border-b border-gray-100 gap-3">
                <Search className="h-5 w-5 text-gray-400" />
                <form onSubmit={handleSearch} className="flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Now"
                        className="w-full text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
                    />
                </form>
                <button
                    onClick={onClose}
                    className="p-2 -mr-2 text-gray-500 hover:text-black"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Suggestions / Results */}
            <div className="flex-1 overflow-y-auto p-4">
                {suggestions.length > 0 ? (
                    <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Suggestions
                        </h3>
                        <div className="space-y-2">
                            {suggestions.map((product) => (
                                <Link
                                    href={`/product/${product.id}`}
                                    key={product.id}
                                    prefetch={false}
                                    className="flex gap-4 items-center group py-2"
                                    onClick={() => {
                                        onClose();
                                        setSearchQuery("");
                                    }}
                                >
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {product.images && product.images[0] && (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-gray-500 line-clamp-1">
                                            {product.brand?.name || product.category?.name}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <button
                            onClick={(e) => handleSearch(e)}
                            className="w-full py-3 mt-4 text-sm font-semibold text-primary bg-primary/5 rounded-lg border border-primary/10"
                        >
                            View all results for "{searchQuery}"
                        </button>
                    </div>
                ) : searchQuery.length > 1 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p>No results found for "{searchQuery}"</p>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <p>Type to search products...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client"

import { Dock } from "@/components/ui/dock-two"
import {
    Home,
    ShoppingCart,
    Heart,
    User
} from "lucide-react"
import { useCartStore } from "@/store/cart"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function MobileDock() {
    const pathname = usePathname();
    const router = useRouter();

    // To avoid hydration mismatch, we delay rendering state dependent on localStorage
    const [mounted, setMounted] = useState(false);
    const cartItems = useCartStore((state) => state.items);
    const wishlist = useCartStore((state) => state.wishlist);

    useEffect(() => {
        setMounted(true);
    }, []);

    const cartCount = mounted ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;
    const wishlistCount = mounted ? wishlist.length : 0;

    const items = [
        {
            icon: Home,
            label: "Home",
            isActive: pathname === "/",
            onClick: () => router.push("/")
        },
        {
            icon: ShoppingCart,
            label: "Cart",
            isActive: pathname === "/cart" || pathname === "/checkout",
            badge: cartCount,
            onClick: () => router.push("/cart")
        },
        {
            icon: Heart,
            label: "Wishlist",
            isActive: pathname === "/wishlist",
            badge: wishlistCount,
            onClick: () => router.push("/wishlist")
        },
        {
            icon: User,
            label: "Profile",
            isActive: pathname?.startsWith("/profile") || pathname?.startsWith("/dashboard") || pathname?.startsWith("/auth"),
            onClick: () => router.push("/profile")
        }
    ]
    const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";
    const hideDock = isAuthPage || pathname === "/profile/settings" || pathname?.startsWith("/profile/orders") || pathname === "/profile/addresses" || pathname === "/profile/reviews";

    if (hideDock) {
        return null;
    }

    return <Dock items={items} />
} 
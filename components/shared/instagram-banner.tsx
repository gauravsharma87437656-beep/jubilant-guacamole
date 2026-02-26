"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function InstagramBanner() {
    const pathname = usePathname();
    const isMobileHiddenPage = pathname === "/cart" || pathname?.startsWith("/profile") || pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";
    const isLegalPage = pathname?.startsWith("/legal") || pathname === "/faq";

    if (isLegalPage) return null;

    return (
        <div className={cn("w-full bg-black", isMobileHiddenPage && "hidden md:block")}>
            <Image
                src="/Screenshot 2026-02-19 161831.png"
                alt="Shop Instagram"
                width={1920}
                height={1080}
                className="w-full h-auto block"
                quality={100}
            />
        </div>
    );
}

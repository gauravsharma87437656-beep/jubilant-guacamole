
import Image from "next/image";

export function InstagramBanner() {
    return (
        <div className="w-full bg-black">
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

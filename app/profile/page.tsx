"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User as UserIcon, FileText, MapPin, Star, Settings, ChevronRight } from "lucide-react";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const menuItems = [
        {
            icon: <FileText className="w-5 h-5 md:w-5 md:h-5" />,
            label: "My Orders",
            onClick: () => router.push("/profile/orders"),
        },
        {
            icon: <MapPin className="w-5 h-5 md:w-5 md:h-5" />,
            label: "Shipping Addresses",
            onClick: () => router.push("/profile/addresses"),
        },
        {
            icon: <Star className="w-5 h-5 md:w-5 md:h-5" />,
            label: "My Reviews",
            onClick: () => router.push("/profile/reviews"),
        },
        {
            icon: <Settings className="w-5 h-5 md:w-5 md:h-5" />,
            label: "Settings",
            onClick: () => router.push("/profile/settings"),
        },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col pb-24 md:pb-24">
            {/* Header */}
            <div className="flex items-center justify-center pt-6 pb-3 md:pt-8 md:pb-4">
                <h1 className="text-lg md:text-[22px] font-medium md:font-extrabold text-gray-900 tracking-tight">
                    Profile
                </h1>
            </div>

            <div className="px-4 md:px-5 py-3 md:py-4 flex-1 flex flex-col max-w-2xl mx-auto w-full">
                {status === "unauthenticated" ? (
                    <div className="flex-1 flex flex-col items-center justify-center -mt-10">
                        <div className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full bg-[#E5E7EB] flex items-center justify-center mb-5 md:mb-6">
                            <UserIcon className="w-10 h-10 md:w-14 md:h-14 text-[#6B7280] fill-[#6B7280]" />
                        </div>
                        <h2 className="text-lg md:text-[20px] font-medium md:font-bold text-gray-900 mb-2 md:mb-3">
                            Guest User
                        </h2>
                        <p className="text-[14px] md:text-[15px] text-gray-500 text-center max-w-[260px] md:max-w-[280px] leading-relaxed mb-6 md:mb-8">
                            Log in to view your profile, orders, and addresses.
                        </p>
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-[#111111] text-white font-medium md:font-bold text-[14px] md:text-[16px] px-8 py-3 md:px-12 md:py-4 rounded-full shadow-lg shadow-black/10 active:scale-[0.98] transition-all"
                        >
                            Login / Sign Up
                        </button>
                    </div>
                ) : (
                    <>
                        {/* User Info Section */}
                        <div className="flex flex-col items-center mb-6 md:mb-8">
                            <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center mb-3 md:mb-4 shadow-lg md:shadow-xl shadow-blue-500/20">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="User avatar" className="w-[76px] h-[76px] md:w-[96px] md:h-[96px] rounded-full object-cover border-2 border-white" />
                                ) : (
                                    <UserIcon className="w-10 h-10 md:w-12 md:h-12 text-white fill-white" strokeWidth={1.5} />
                                )}
                            </div>
                            <h2 className="text-lg md:text-[22px] font-medium md:font-bold text-gray-900 tracking-tight leading-none mb-1 md:mb-2">
                                {session?.user?.name || "test hrg"}
                            </h2>
                            <p className="text-[13px] md:text-[14px] text-gray-500">
                                {session?.user?.email || "yapir63969@iaciu.com"}
                            </p>
                        </div>

                        {/* Menu Items Card */}
                        <div className="bg-white rounded-[20px] md:rounded-[24px] shadow-sm border border-gray-50 overflow-hidden px-4 md:px-5 py-2 md:py-3 mt-1 md:mt-2">
                            {menuItems.map((item, index) => (
                                <button
                                    key={item.label}
                                    onClick={item.onClick}
                                    className={`w-full flex items-center justify-between py-4 md:py-5 hover:bg-gray-50/50 active:bg-gray-50 transition-colors ${index !== menuItems.length - 1 ? "border-b border-gray-50" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-4 md:gap-5">
                                        <div className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] rounded-full bg-[#f8f9fa] border border-gray-100 flex items-center justify-center text-gray-700">
                                            {item.icon}
                                        </div>
                                        <span className="font-medium md:font-bold text-[14px] md:text-[15px] text-gray-900">{item.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                                </button>
                            ))}
                        </div>

                        {/* Log Out Button */}
                        <div className="mt-6 md:mt-8 flex justify-center">
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="font-medium md:font-bold text-[13px] md:text-[14px] text-[#FF4444] hover:text-red-600 transition-colors py-2 px-6 md:py-3 md:px-8 rounded-full active:bg-red-50/50"
                            >
                                Log Out
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

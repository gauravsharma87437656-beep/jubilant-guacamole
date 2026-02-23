"use client";

import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, Loader2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface RentalItem {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    variantSize: string | null;
    variantColor: string | null;
    dailyPrice: number;
    rentalDays: number;
    subtotal: number;
}

interface Payment {
    id: string;
    amount: number;
    method: string;
    status: string;
    rentalCost: number;
    deposit: number;
    deliveryFee: number;
    tax: number;
    platformFee: number;
}

interface Rental {
    id: string;
    orderNumber: string;
    status: string;
    rentalStartDate: string;
    rentalEndDate: string;
    subtotal: number;
    depositAmount: number;
    deliveryFee: number;
    platformFee: number;
    taxAmount: number;
    totalAmount: number;
    shippingAddress: {
        firstName: string;
        lastName: string;
        address1: string;
        address2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone?: string;
    };
    trackingNumber: string | null;
    carrier: string | null;
    createdAt: string;
    items: RentalItem[];
    payment: Payment | null;
}

const statusSteps = [
    { key: "PENDING", label: "Order Placed" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "ACTIVE", label: "Ready / Shipped" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "COMPLETED", label: "Completed" },
];

const statusOrder: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    SHIPPED: 2,
    ACTIVE: 2,
    DELIVERED: 3,
    RETURN_REQUESTED: 4,
    RETURNED: 4,
    COMPLETED: 4,
    CANCELLED: -1,
};

export default function OrderDetailPage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const orderId = params?.id as string;

    const [rental, setRental] = useState<Rental | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && orderId) {
            fetchOrderDetail();
        }
    }, [status, orderId]);

    const fetchOrderDetail = async () => {
        try {
            const response = await fetch(`/api/user/rentals/${orderId}`);
            if (response.ok) {
                const data = await response.json();
                setRental(data.rental);
            } else {
                setError("Order not found");
            }
        } catch (err) {
            console.error("Error fetching order:", err);
            setError("Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        setCancelling(true);
        try {
            const response = await fetch(`/api/user/rentals/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "cancel" }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("Order cancelled successfully");
                setShowCancelConfirm(false);
                fetchOrderDetail(); // Refresh
            } else {
                toast.error(data.error || "Failed to cancel order");
            }
        } catch (err) {
            console.error("Error cancelling order:", err);
            toast.error("Failed to cancel order");
        } finally {
            setCancelling(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            CASH_ON_DELIVERY: "Cash on Delivery",
            CARD: "Card",
            WALLET: "Wallet",
            BANK_TRANSFER: "Bank Transfer",
        };
        return labels[method] || method;
    };

    const getPaymentStatusColor = (sts: string) => {
        const colors: Record<string, string> = {
            PENDING: "text-orange-500",
            PROCESSING: "text-blue-500",
            COMPLETED: "text-green-600",
            FAILED: "text-red-500",
            REFUNDED: "text-purple-500",
        };
        return colors[sts] || "text-gray-500";
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            PENDING: "Order Placed",
            CONFIRMED: "Confirmed",
            SHIPPED: "Shipped",
            ACTIVE: "Ready / Shipped",
            DELIVERED: "Delivered",
            COMPLETED: "Completed",
            RETURN_REQUESTED: "Return Requested",
            RETURNED: "Returned",
            CANCELLED: "Cancelled",
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: "bg-amber-100 text-amber-700",
            CONFIRMED: "bg-blue-100 text-blue-700",
            SHIPPED: "bg-indigo-100 text-indigo-700",
            ACTIVE: "bg-violet-100 text-violet-700",
            DELIVERED: "bg-emerald-100 text-emerald-700",
            COMPLETED: "bg-gray-100 text-gray-700",
            CANCELLED: "bg-red-100 text-red-700",
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        redirect("/login");
    }

    if (error || !rental) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
                    <div className="md:hidden flex items-center justify-center pt-1 pb-4 relative">
                        <Link href="/profile/orders" className="absolute left-0 text-gray-900 p-2 -ml-2">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <h1 className="text-[18px] font-bold text-gray-900">Order Details</h1>
                    </div>
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Order not found</h2>
                        <Link href="/profile/orders" className="text-primary font-medium hover:underline">
                            Back to orders
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentStep = statusOrder[rental.status] ?? -1;
    const isCancelled = rental.status === "CANCELLED";
    const canCancel = ["PENDING", "CONFIRMED"].includes(rental.status);

    return (
        <div className="bg-gray-50 min-h-screen pb-4 md:pb-8">
            <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">

                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-center pt-1 pb-4 relative">
                    <Link href="/profile/orders" className="absolute left-0 text-gray-900 p-2 -ml-2">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-[16px] font-bold text-gray-900 tracking-tight">
                        Order #{rental.orderNumber}
                    </h1>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:block mb-8">
                    <Link href="/profile/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Order #{rental.orderNumber}</h1>
                            <p className="mt-1 text-gray-500">Placed on {formatDate(rental.createdAt)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(rental.status)}`}>
                            {getStatusLabel(rental.status)}
                        </span>
                    </div>
                </div>

                <div className="space-y-3 md:space-y-4">

                    {/* Order Status Timeline */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                        <h2 className="text-[16px] md:text-lg font-bold text-gray-900 mb-5">Order Status</h2>

                        {isCancelled ? (
                            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-red-700">Cancelled</p>
                                    <p className="text-sm text-red-500">This order has been cancelled</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative pl-5">
                                {statusSteps.map((step, index) => {
                                    const isCompleted = currentStep >= index;
                                    const isCurrent = currentStep === index;
                                    return (
                                        <div key={step.key} className="relative pb-6 last:pb-0">
                                            {/* Vertical line */}
                                            {index < statusSteps.length - 1 && (
                                                <div className={`absolute left-0 top-4 w-0.5 h-full -translate-x-1/2 ${isCompleted ? "bg-gray-900" : "bg-gray-200"}`} />
                                            )}
                                            {/* Dot */}
                                            <div className={`absolute left-0 top-1 w-3 h-3 rounded-full -translate-x-1/2 border-2 ${isCompleted
                                                ? "bg-gray-900 border-gray-900"
                                                : "bg-white border-gray-300"
                                                }`} />
                                            {/* Content */}
                                            <div className="ml-5">
                                                <p className={`text-[14px] font-semibold ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                                                    {step.label}
                                                </p>
                                                {isCurrent && isCompleted && index === 0 && (
                                                    <p className="text-[13px] text-gray-400 mt-0.5">{formatDate(rental.createdAt)}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Cancel Order Button */}
                    {canCancel && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                            {showCancelConfirm ? (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-red-700 text-sm">Are you sure you want to cancel this order?</p>
                                            <p className="text-xs text-red-500 mt-0.5">This action cannot be undone. The booked dates will become available again.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleCancelOrder}
                                            disabled={cancelling}
                                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {cancelling ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <XCircle className="w-4 h-4" />
                                            )}
                                            {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
                                        </button>
                                        <button
                                            onClick={() => setShowCancelConfirm(false)}
                                            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all font-bold text-sm"
                                        >
                                            Keep Order
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowCancelConfirm(true)}
                                    className="w-full px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 active:scale-[0.98] transition-all font-bold text-sm flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    )}

                    {/* Products */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                        <h2 className="text-[16px] md:text-lg font-bold text-gray-900 mb-4">Products</h2>
                        <div className="space-y-4">
                            {rental.items.map((item) => (
                                <div key={item.id} className="flex gap-3 md:gap-4">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                        {item.productImage ? (
                                            <img
                                                src={item.productImage}
                                                alt={item.productName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/product/${item.productId}`} className="font-semibold text-[14px] md:text-[15px] text-gray-900 hover:text-primary line-clamp-2">
                                            {item.productName}
                                        </Link>
                                        {item.variantSize && (
                                            <p className="text-[13px] text-gray-500">Size: {item.variantSize}</p>
                                        )}
                                        {item.variantColor && (
                                            <p className="text-[13px] text-gray-500">Color: {item.variantColor}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-[15px] font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                                            <p className="text-[13px] text-gray-400">{item.rentalDays} days</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rental Period */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                        <h2 className="text-[16px] md:text-lg font-bold text-gray-900 mb-3">Rental Period</h2>
                        <div className="flex items-center gap-3 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                            <div className="text-sm text-blue-900 font-semibold">
                                {formatDate(rental.rentalStartDate)} → {formatDate(rental.rentalEndDate)}
                            </div>
                        </div>
                    </div>

                    {/* Shipping Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                        <h2 className="text-[16px] md:text-lg font-bold text-gray-900 mb-3">Shipping Details</h2>
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[14px] text-gray-600 leading-relaxed">
                                {rental.shippingAddress.address1}
                                {rental.shippingAddress.address2 && `, ${rental.shippingAddress.address2}`}
                                , {rental.shippingAddress.city}, {rental.shippingAddress.state} {rental.shippingAddress.postalCode}, {rental.shippingAddress.country}
                            </p>
                        </div>
                        {rental.trackingNumber && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-[13px] text-gray-500">Tracking: <span className="text-gray-900 font-medium">{rental.trackingNumber}</span></p>
                            </div>
                        )}
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
                        <h2 className="text-[16px] md:text-lg font-bold text-gray-900 mb-4">Payment Summary</h2>

                        {rental.payment && (
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-[14px]">
                                    <span className="text-gray-500">Payment Method</span>
                                    <span className="font-semibold text-gray-900">{getPaymentMethodLabel(rental.payment.method)}</span>
                                </div>
                                <div className="flex items-center justify-between text-[14px]">
                                    <span className="text-gray-500">Payment Status</span>
                                    <span className={`font-semibold ${getPaymentStatusColor(rental.payment.status)}`}>
                                        {rental.payment.status}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-100 pt-3 space-y-2">
                            <div className="flex items-center justify-between text-[14px]">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-900">{formatCurrency(Number(rental.subtotal))}</span>
                            </div>
                            {Number(rental.depositAmount) > 0 && (
                                <div className="flex items-center justify-between text-[14px]">
                                    <span className="text-gray-500">Deposit</span>
                                    <span className="text-gray-900">{formatCurrency(Number(rental.depositAmount))}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-[14px]">
                                <span className="text-gray-500">Shipping</span>
                                <span className="text-gray-900">{formatCurrency(Number(rental.deliveryFee))}</span>
                            </div>
                            {Number(rental.taxAmount) > 0 && (
                                <div className="flex items-center justify-between text-[14px]">
                                    <span className="text-gray-500">Tax</span>
                                    <span className="text-gray-900">{formatCurrency(Number(rental.taxAmount))}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 mt-3 pt-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[15px] font-bold text-gray-900">Total</span>
                                <span className="text-[18px] font-bold text-gray-900">{formatCurrency(Number(rental.totalAmount))}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Cancel Confirmation Overlay for mobile */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 md:hidden flex items-end" onClick={() => setShowCancelConfirm(false)}>
                    <div className="bg-white w-full rounded-t-2xl p-5 space-y-4 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
                        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-gray-900">Cancel this order?</p>
                                <p className="text-sm text-gray-500 mt-1">This action cannot be undone. The booked dates will become available for others to book.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                {cancelling ? "Cancelling..." : "Yes, Cancel"}
                            </button>
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all font-bold text-sm"
                            >
                                Keep Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

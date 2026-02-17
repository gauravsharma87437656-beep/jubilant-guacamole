"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowLeft, Loader2, Calendar, MapPin, CreditCard } from "lucide-react";

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
  status: string;
}

interface Rental {
  id: string;
  orderNumber: string;
  status: string;
  rentalStartDate: string;
  rentalEndDate: string;
  totalAmount: number;
  depositAmount: number;
  createdAt: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: RentalItem[];
  payment?: {
    status: string;
    method: string;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  ACTIVE: "bg-green-100 text-green-800",
  RETURN_REQUESTED: "bg-orange-100 text-orange-800",
  RETURNED: "bg-gray-100 text-gray-800",
  LATE: "bg-red-100 text-red-800",
  CANCELLED: "bg-red-100 text-red-800",
  DISPUTED: "bg-red-100 text-red-800",
};

export default function CustomerRentalsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/rentals")
        .then((res) => res.json())
        .then((data) => {
          if (data.rentals) {
            setRentals(data.rentals);
          }
        })
        .catch((err) => console.error("Failed to fetch rentals:", err))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard/customer" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Rentals</h1>
          <p className="mt-2 text-gray-600">View and manage your active and past rentals</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : rentals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">No Rentals Yet</h2>
            <p className="mt-2 text-gray-600">You haven't placed any orders yet. Start browsing our collection!</p>
            <Link href="/categories" className="mt-4 inline-block text-rose-600 hover:text-rose-700 font-medium">
              Browse Categories
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <div key={rental.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Order #</span>
                      <span className="ml-1 font-medium text-gray-900">{rental.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Placed on</span>
                      <span className="ml-1 text-gray-900">{formatDate(rental.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[rental.status] || "bg-gray-100 text-gray-800"}`}>
                    {rental.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <div className="space-y-4">
                    {rental.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.productId}`} className="font-medium text-gray-900 hover:text-primary">
                            {item.productName}
                          </Link>
                          {item.variantSize && (
                            <p className="text-sm text-gray-500">Size: {item.variantSize}</p>
                          )}
                          {item.variantColor && (
                            <p className="text-sm text-gray-500">Color: {item.variantColor}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            {item.rentalDays} day(s) × {formatCurrency(item.dailyPrice)}/day
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-500">Rental Period</p>
                        <p className="text-gray-900">
                          {formatDate(rental.rentalStartDate)} - {formatDate(rental.rentalEndDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-500">Delivery Address</p>
                        <p className="text-gray-900">
                          {rental.shippingAddress.firstName} {rental.shippingAddress.lastName}, {rental.shippingAddress.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-500">Payment</p>
                        <p className="text-gray-900">
                          {rental.payment?.method === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "Card"} - {rental.payment?.status || "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Total */}
                <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Deposit: {formatCurrency(Number(rental.depositAmount))}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Total: </span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(Number(rental.totalAmount))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

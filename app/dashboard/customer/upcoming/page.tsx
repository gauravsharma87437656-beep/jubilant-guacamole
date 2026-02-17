"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowLeft, Loader2, Package, Calendar, MapPin, CreditCard } from "lucide-react";

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
    city: string;
    state: string;
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
};

export default function CustomerUpcomingPage() {
  const { data: session, status } = useSession();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/rentals")
        .then((res) => res.json())
        .then((data) => {
          if (data.rentals) {
            // Filter upcoming rentals (start date is in the future)
            const now = new Date();
            const upcoming = data.rentals.filter((r: Rental) => {
              const startDate = new Date(r.rentalStartDate);
              return (r.status === "CONFIRMED" || r.status === "SHIPPED" || r.status === "PENDING") && startDate > now;
            });
            setRentals(upcoming);
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
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Rentals</h1>
          <p className="mt-2 text-gray-600">See your scheduled rentals</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : rentals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">No Upcoming Rentals</h2>
            <p className="mt-2 text-gray-600">You have no upcoming rentals. Browse our collection to find something to rent!</p>
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

                {/* Rental Period */}
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Rental Period:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(rental.rentalStartDate)} - {formatDate(rental.rentalEndDate)}
                    </span>
                  </div>
                </div>

                {/* Order Total */}
                <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center">
                  <div></div>
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

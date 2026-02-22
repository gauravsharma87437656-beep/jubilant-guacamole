"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard, Truck, ShieldCheck, ChevronDown, ChevronUp, Shield, Info, ArrowRight, ShoppingBag } from "lucide-react";
import { differenceInDays } from "date-fns";

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, getTotalDeposit, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showItemsBreakdown, setShowItemsBreakdown] = useState(false);
  const [showDepositBreakdown, setShowDepositBreakdown] = useState(false);
  const [showPlatformBreakdown, setShowPlatformBreakdown] = useState(false);

  const totalDeposit = getTotalDeposit();
  const subtotal = items.reduce((sum, item) => {
    const days = item.rentalStart && item.rentalEnd
      ? Math.max(1, differenceInDays(new Date(item.rentalEnd), new Date(item.rentalStart)) + 1)
      : 1;
    return sum + (item.dailyPrice * days * item.quantity);
  }, 0);
  const platformFee = Math.round(subtotal * 0.05);
  const total = subtotal + totalDeposit + platformFee;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    if (status === "authenticated" && items.length === 0) {
      router.push("/cart");
      return;
    }

    if (status === "authenticated") {
      fetchAddresses();
    }
  }, [status, items.length, router]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses");
      const data = await res.json();
      setAddresses(data.addresses || []);
      const defaultAddr = data.addresses?.find((a: Address) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    setProcessing(true);

    try {
      // Create rental orders for each item
      const orderPromises = items.map(async (item) => {
        const rentalDays = item.rentalStart && item.rentalEnd
          ? Math.max(1, differenceInDays(new Date(item.rentalEnd), new Date(item.rentalStart)) + 1)
          : 3;

        const orderNumber = `RS${Date.now()}${Math.random().toString(36).substring(2, 7)}`.toUpperCase();

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber,
            productId: item.productId,
            variantId: item.variantId,
            vendorId: item.vendorId,
            rentalStart: item.rentalStart || new Date(),
            rentalEnd: item.rentalEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            rentalDays,
            dailyPrice: item.dailyPrice,
            depositAmount: item.depositAmount,
            shippingAddressId: selectedAddress,
            paymentMethod,
          }),
        });

        return res;
      });

      const results = await Promise.all(orderPromises);
      const allSuccess = results.every((res) => res.ok);

      if (allSuccess) {
        clearCart();
        router.push("/checkout/success");
      } else {
        // Get error details from failed requests
        for (const res of results) {
          if (!res.ok) {
            const errorData = await res.json();
            alert(`Order failed: ${errorData.error || "Unknown error"}`);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <Link href="/categories">
            <Button className="mt-4">Browse Collection</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-5 sm:mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-0.5" />
            Back to Cart
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-colors ${step >= s
                  ? "bg-rose-600 text-white"
                  : "bg-gray-200 text-gray-500"
                  }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-1.5 sm:mx-2 transition-colors ${step > s ? "bg-rose-600" : "bg-gray-200"
                    }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Select Delivery Address
                </h2>

                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm mb-4">No addresses saved</p>
                    <Link href="/profile/addresses">
                      <Button className="bg-rose-600 hover:bg-rose-700 rounded-xl">Add New Address</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-3 sm:p-4 border rounded-xl cursor-pointer transition-all ${selectedAddress === address.id
                          ? "border-rose-500 bg-rose-50/50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddress === address.id}
                            onChange={() => setSelectedAddress(address.id)}
                            className="mt-1 accent-rose-600"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-[14px] sm:text-base">
                              {address.firstName} {address.lastName}
                              {address.isDefault && (
                                <span className="ml-2 text-[10px] sm:text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                                  Default
                                </span>
                              )}
                            </p>
                            <p className="text-[13px] sm:text-sm text-gray-500 mt-0.5">
                              {address.address1}
                              {address.address2 && `, ${address.address2}`}
                            </p>
                            <p className="text-[13px] sm:text-sm text-gray-500">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            {address.phone && (
                              <p className="text-[13px] sm:text-sm text-gray-500">
                                Phone: {address.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                    <Link
                      href="/profile/addresses"
                      className="block text-center text-rose-600 hover:text-rose-700 text-sm font-medium py-2"
                    >
                      + Add New Address
                    </Link>
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedAddress}
                    className="bg-rose-600 hover:bg-rose-700 rounded-xl px-6 h-11 font-semibold"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Select Payment Method
                </h2>

                <div className="space-y-3">
                  <label
                    className={`block p-3 sm:p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "card"
                      ? "border-rose-500 bg-rose-50/50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="accent-rose-600"
                      />
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900 text-[14px] sm:text-base">
                        Credit / Debit Card
                      </span>
                    </div>
                  </label>

                  <label
                    className={`block p-3 sm:p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "cod"
                      ? "border-rose-500 bg-rose-50/50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-rose-600"
                      />
                      <Truck className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900 text-[14px] sm:text-base">
                        Cash on Delivery
                      </span>
                    </div>
                  </label>
                </div>

                <div className="mt-5 flex gap-3 justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-gray-200 text-gray-700 font-medium hover:bg-gray-50 rounded-xl px-6 h-11"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="bg-rose-600 hover:bg-rose-700 rounded-xl px-6 h-11 font-semibold"
                  >
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Order Review */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Review Your Order
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="w-14 h-[70px] sm:w-20 sm:h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-[13px] sm:text-base line-clamp-1">
                          {item.productName}
                        </h3>
                        <p className="text-[12px] sm:text-sm text-gray-500">
                          Size: {item.variantSize || "N/A"}
                        </p>
                        <p className="text-[12px] sm:text-sm text-gray-500">
                          ₹{item.dailyPrice} × {item.rentalStart && item.rentalEnd ? Math.max(1, differenceInDays(new Date(item.rentalEnd), new Date(item.rentalStart)) + 1) : 1} days × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900 text-[13px] sm:text-base">
                          ₹{(item.dailyPrice * (item.rentalStart && item.rentalEnd ? Math.max(1, differenceInDays(new Date(item.rentalEnd), new Date(item.rentalStart)) + 1) : 1) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl mb-3">
                  <h3 className="font-medium text-gray-900 text-[13px] sm:text-sm mb-1">
                    Delivery Address
                  </h3>
                  {addresses
                    .filter((a) => a.id === selectedAddress)
                    .map((address) => (
                      <p key={address.id} className="text-[12px] sm:text-sm text-gray-500">
                        {address.firstName} {address.lastName}, {address.address1}
                        {address.address2 && `, ${address.address2}`}, {address.city},{" "}
                        {address.state} {address.postalCode}
                      </p>
                    ))}
                </div>

                {/* Payment Method */}
                <div className="p-3 sm:p-4 bg-gray-50 rounded-xl mb-5">
                  <h3 className="font-medium text-gray-900 text-[13px] sm:text-sm mb-1">
                    Payment Method
                  </h3>
                  <p className="text-[12px] sm:text-sm text-gray-500">
                    {paymentMethod === "card" ? "Credit / Debit Card" : "Cash on Delivery"}
                  </p>
                </div>

                <div className="flex gap-3 justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="border-gray-200 text-gray-700 font-medium hover:bg-gray-50 rounded-xl px-6 h-11"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={processing}
                    className="bg-rose-600 hover:bg-rose-700 rounded-xl px-6 h-11 font-semibold"
                  >
                    {processing ? "Processing..." : "Place Order"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 sticky top-4 shadow-sm">
              <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

              <div className="space-y-3 mb-4 sm:mb-6">
                {/* Subtotal with Breakdown */}
                <div className="space-y-1.5">
                  <div
                    className="flex justify-between items-center text-gray-600 text-[13px] sm:text-sm cursor-pointer hover:bg-gray-50 p-1.5 -m-1.5 rounded-lg transition-colors group"
                    onClick={() => setShowItemsBreakdown(!showItemsBreakdown)}
                  >
                    <span className="flex items-center gap-1 font-medium">
                      Subtotal ({items.length})
                      {showItemsBreakdown ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                    </span>
                    <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  {showItemsBreakdown && (
                    <div className="pl-3 pr-1 py-2 space-y-1.5 border-l-2 border-rose-100 bg-rose-50/30 rounded-r-xl">
                      {items.map((item) => {
                        const days = item.rentalStart && item.rentalEnd
                          ? Math.max(1, differenceInDays(new Date(item.rentalEnd), new Date(item.rentalStart)) + 1)
                          : 1;
                        return (
                          <div key={item.id} className="flex justify-between text-[11px] text-gray-500">
                            <span className="flex-1 pr-3 line-clamp-1">{item.productName} ({item.quantity}×{days}d)</span>
                            <span className="font-medium text-gray-700">₹{(item.dailyPrice * days * item.quantity).toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Deposit with Breakdown */}
                <div className="space-y-1.5">
                  <div
                    className="flex justify-between items-center text-gray-600 text-[13px] sm:text-sm cursor-pointer hover:bg-gray-50 p-1.5 -m-1.5 rounded-lg transition-colors group"
                    onClick={() => setShowDepositBreakdown(!showDepositBreakdown)}
                  >
                    <span className="flex items-center gap-1 font-medium">
                      Deposit
                      {showDepositBreakdown ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                    </span>
                    <span className="font-semibold text-gray-900">₹{totalDeposit.toLocaleString()}</span>
                  </div>
                  {showDepositBreakdown && (
                    <div className="pl-3 pr-1 py-2 space-y-1.5 border-l-2 border-gray-100 bg-gray-50/50 rounded-r-xl">
                      {items.map((item) => (
                        <div key={`dep-${item.id}`} className="flex justify-between text-[11px] text-gray-500">
                          <span className="flex-1 pr-3 line-clamp-1">{item.productName} (×{item.quantity})</span>
                          <span className="font-medium text-gray-700">₹{(item.depositAmount * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Platform Fee */}
                <div className="space-y-1.5">
                  <div
                    className="flex justify-between items-center text-gray-600 text-[13px] sm:text-sm cursor-pointer hover:bg-gray-50 p-1.5 -m-1.5 rounded-lg transition-colors group"
                    onClick={() => setShowPlatformBreakdown(!showPlatformBreakdown)}
                  >
                    <span className="flex items-center gap-1 font-medium">
                      Platform Fee (5%)
                      {showPlatformBreakdown ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                    </span>
                    <span className="font-semibold text-gray-900">₹{platformFee.toLocaleString()}</span>
                  </div>
                  {showPlatformBreakdown && (
                    <div className="pl-3 pr-1 py-2 border-l-2 border-emerald-100 bg-emerald-50/30 rounded-r-xl">
                      <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium">
                        Includes secure transaction insurance
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-[13px] sm:text-sm text-gray-600">
                  <span className="font-medium">Delivery</span>
                  <span className="text-emerald-600 font-semibold text-xs uppercase tracking-wider">Free</span>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex justify-between items-baseline mb-4 sm:mb-6">
                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Total</span>
                    <span className="text-2xl sm:text-3xl font-bold text-rose-600">₹{Math.round(total).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4 sm:mb-6">
                <div className="flex items-start gap-2.5 text-[12px] sm:text-xs text-gray-600">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Secure Checkout</p>
                    <p className="text-gray-500 leading-relaxed mt-0.5">Payment encrypted. Deposit 100% refundable.</p>
                  </div>
                </div>
              </div>

              {step === 3 ? (
                <Button
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 sm:h-14 rounded-xl shadow-lg shadow-rose-100 transition-all active:scale-[0.98] text-base sm:text-lg"
                  onClick={handlePlaceOrder}
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Place Order"}
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              ) : (
                <p className="text-center text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Complete steps to place order
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


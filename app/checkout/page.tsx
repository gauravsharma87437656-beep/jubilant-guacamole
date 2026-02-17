"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard, Truck, ShieldCheck } from "lucide-react";

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

  const totalDeposit = getTotalDeposit();
  const subtotal = items.reduce((sum, item) => sum + item.dailyPrice * item.quantity, 0);
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
          ? Math.ceil(
              (new Date(item.rentalEnd).getTime() - new Date(item.rentalStart).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 1;

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? "bg-rose-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-20 h-1 mx-2 ${
                    step > s ? "bg-rose-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Delivery Address
                </h2>

                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No addresses saved</p>
                    <Link href="/dashboard/customer/addresses">
                      <Button>Add New Address</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddress === address.id
                            ? "border-rose-600 bg-rose-50"
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
                            className="mt-1"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {address.firstName} {address.lastName}
                              {address.isDefault && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.address1}
                              {address.address2 && `, ${address.address2}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            {address.phone && (
                              <p className="text-sm text-gray-600">
                                Phone: {address.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}

                    <Link
                      href="/dashboard/customer/addresses"
                      className="block text-center text-rose-600 hover:text-rose-700 text-sm"
                    >
                      + Add New Address
                    </Link>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedAddress}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Payment Method
                </h2>

                <div className="space-y-4">
                  <label
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "card"
                        ? "border-rose-600 bg-rose-50"
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
                      />
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        Credit / Debit Card
                      </span>
                    </div>
                  </label>

                  <label
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "cod"
                        ? "border-rose-600 bg-rose-50"
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
                      />
                      <Truck className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        Cash on Delivery
                      </span>
                    </div>
                  </label>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Order Review */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Review Your Order
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-20 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Size: {item.variantSize || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₹{item.dailyPrice}/day × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{(item.dailyPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="p-4 bg-gray-50 rounded-lg mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Delivery Address
                  </h3>
                  {addresses
                    .filter((a) => a.id === selectedAddress)
                    .map((address) => (
                      <p key={address.id} className="text-sm text-gray-600">
                        {address.firstName} {address.lastName}, {address.address1}
                        {address.address2 && `, ${address.address2}`}, {address.city},{" "}
                        {address.state} {address.postalCode}
                      </p>
                    ))}
                </div>

                {/* Payment Method */}
                <div className="p-4 bg-gray-50 rounded-lg mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Payment Method
                  </h3>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === "card" ? "Credit / Debit Card" : "Cash on Delivery"}
                  </p>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={processing}
                    className="bg-rose-600 hover:bg-rose-700"
                  >
                    {processing ? "Processing..." : "Place Order"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate max-w-[150px]">
                      {item.productName}
                    </span>
                    <span className="text-gray-900">
                      ₹{(item.dailyPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Deposit (Refundable)</span>
                  <span>₹{totalDeposit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-gray-900 text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span>Secure checkout powered by RentSquare</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

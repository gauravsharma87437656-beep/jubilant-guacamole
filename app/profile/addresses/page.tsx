"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus, Pencil, Trash2, ArrowLeft, X, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Address {
  id: string;
  type: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: "shipping",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
    isDefault: false,
  });

  // Label selection for mobile bottom sheet
  const [selectedLabel, setSelectedLabel] = useState("Home");

  // Auto-populate user name when session relies
  useEffect(() => {
    if (status === "authenticated" && session?.user?.name && !formData.firstName && !formData.lastName) {
      const nameParts = session.user.name.split(" ");
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || nameParts[0] || "",
        lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
      }));
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAddresses();
    }
  }, [status]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/user/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingAddress
        ? `/api/user/addresses/${editingAddress.id}`
        : "/api/user/addresses";

      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingAddress(null);
        resetForm();
        fetchAddresses();
      }
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      address1: address.address1,
      address2: address.address2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || "",
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    const nameParts = session?.user?.name ? session.user.name.split(" ") : [];
    setFormData({
      type: "shipping",
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      phone: "",
      isDefault: false,
    });
    setSelectedLabel("Home");
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4 md:pb-8">
      <div className="max-w-4xl mx-auto p-4 lg:p-8">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-center pt-1 pb-4 relative">
          <Link href="/profile" className="absolute left-0 text-gray-900 p-2 -ml-2">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">Shipping Addresses</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block mb-8">
          <Link href="/profile" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Addresses</h1>
              <p className="mt-2 text-base text-gray-500">Manage your delivery addresses</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setEditingAddress(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </div>
        </div>

        {/* Desktop Address Form (inline) */}
        {showForm && (
          <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={formData.address1}
                  onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Street address, P.O. box"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Apartment, suite, building, floor, etc."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input type="text" required value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                  <input type="text" required value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white placeholder-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white">
                    <option value="India">India</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 bg-white placeholder-gray-400" placeholder="+91 9876543210" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default address</label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingAddress(null); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Mobile Bottom Sheet for Add/Edit Address */}
        {showForm && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => { setShowForm(false); setEditingAddress(null); resetForm(); }}>
            <div
              className="w-full bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 sticky top-0 bg-white z-10">
                <h2 className="text-[18px] font-bold text-gray-900">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h2>
                <button
                  onClick={() => { setShowForm(false); setEditingAddress(null); resetForm(); }}
                  className="p-1 text-gray-500 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">
                {/* Label Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Label</label>
                  <div className="flex gap-2">
                    {["Home", "Work", "Other"].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedLabel(label)}
                        className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${selectedLabel === label
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address1}
                    onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="123 Main St"
                  />
                </div>

                {/* City / State */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="NY"
                    />
                  </div>
                </div>

                {/* Zip / Country */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Zip Code</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Country</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="India">India</option>
                      <option value="US">USA</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Default Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefaultMobile"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-5 w-5 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefaultMobile" className="text-sm text-gray-700">Set as default address</label>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl text-base hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-500 mb-4">Add an address for faster checkout</p>
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-xl shadow-sm border p-4 ${address.isDefault ? "border-primary" : "border-gray-100"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Home icon on mobile */}
                    <div className="md:hidden flex-shrink-0 mt-0.5">
                      <HomeIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[15px] text-gray-900">
                          <span className="md:inline hidden">{address.firstName} {address.lastName}</span>
                          <span className="md:hidden">Home</span>
                        </h3>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-semibold rounded border border-gray-200">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-[13px] leading-snug">
                        {address.address1}
                        {address.address2 && <>, {address.address2}</>}
                        , {address.city} {address.postalCode}, {address.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Address - dashed button */}
            <button
              onClick={() => {
                resetForm();
                setEditingAddress(null);
                setShowForm(true);
              }}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-medium flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IndianRupee } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Occasion {
  id: string;
  name: string;
}

interface VariantInput {
  size: string;
  color: string;
  inventory: number;
}

const SIZE_PRESETS: Record<string, string[]> = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
  shoes: ["5", "6", "7", "8", "9", "10", "11", "12", "13"],
  jeans: ["26", "28", "30", "32", "34", "36", "38", "40", "42"],
  onesize: ["Free Size"],
};

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    brandId: "",
    occasionId: "",
    gender: "",
    dailyPrice: "",
    weeklyPrice: "",
    depositAmount: "50",
    condition: "new",
    careInstructions: "",
    images: [] as string[],
  });
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [sizeType, setSizeType] = useState("clothing");

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchOccasions();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch("/api/brands");
      const data = await res.json();
      if (res.ok) {
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchOccasions = async () => {
    try {
      const res = await fetch("/api/occasions?active=true");
      const data = await res.json();
      if (res.ok) {
        setOccasions(data.occasions || []);
      }
    } catch (error) {
      console.error("Error fetching occasions:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse image URLs
      const images = imageUrls
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const res = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images,
          dailyPrice: parseFloat(formData.dailyPrice),
          weeklyPrice: formData.weeklyPrice ? parseFloat(formData.weeklyPrice) : null,
          depositAmount: parseFloat(formData.depositAmount),
          variants: variants.filter((v) => v.size),
        }),
      });

      if (res.ok) {
        router.push("/dashboard/vendor/products");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/vendor/products"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Add New Product</h1>
        <p className="text-gray-600">Create a new rental listing</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6 space-y-8">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Basic Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 placeholder:text-gray-500 bg-white transition-all font-medium"
                  placeholder="e.g., Elegant Evening Gown"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 placeholder:text-gray-500 bg-white transition-all font-medium"
                  placeholder="Describe your product..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 bg-gray-50/50 transition-all font-medium"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 bg-gray-50/50 transition-all font-medium"
                  >
                    <option value="">Select brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Occasion
                  </label>
                  <select
                    value={formData.occasionId}
                    onChange={(e) => setFormData({ ...formData, occasionId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 bg-gray-50/50 transition-all font-medium"
                  >
                    <option value="">Select occasion</option>
                    {occasions.map((occ) => (
                      <option key={occ.id} value={occ.id}>
                        {occ.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 bg-gray-50/50 transition-all font-medium"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="NONE">None</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Daily Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.dailyPrice}
                    onChange={(e) => setFormData({ ...formData, dailyPrice: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 placeholder:text-gray-500 bg-white transition-all font-medium"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weekly Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.weeklyPrice}
                    onChange={(e) => setFormData({ ...formData, weeklyPrice: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 placeholder:text-gray-500 bg-white transition-all font-medium"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deposit Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 placeholder:text-gray-500 bg-white transition-all font-medium"
                    placeholder="50.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Condition */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Details & Condition</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Condition
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 bg-gray-50/50 transition-all font-medium"
                >
                  <option value="new">New</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Care Instructions
                </label>
                <textarea
                  rows={3}
                  value={formData.careInstructions}
                  onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 placeholder:text-gray-400 bg-gray-50/50 transition-all font-medium"
                  placeholder="e.g., Dry clean only, Handle with care..."
                />
              </div>
            </div>
          </div>

          {/* Size & Inventory */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Size &amp; Inventory</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Size Type</label>
                <select
                  value={sizeType}
                  onChange={(e) => setSizeType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 bg-gray-50/50 transition-all font-medium"
                >
                  <option value="clothing">Clothing (XS, S, M, L, XL...)</option>
                  <option value="shoes">Shoes (5, 6, 7, 8...)</option>
                  <option value="jeans">Jeans (26, 28, 30, 32...)</option>
                  <option value="onesize">One Size</option>
                </select>
              </div>
              {variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Size</label>
                    <select
                      value={variant.size}
                      onChange={(e) => { const u = [...variants]; u[index].size = e.target.value; setVariants(u); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 bg-white font-medium"
                    >
                      <option value="">Select size</option>
                      {SIZE_PRESETS[sizeType].map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Color (Optional)</label>
                    <input type="text" value={variant.color} onChange={(e) => { const u = [...variants]; u[index].color = e.target.value; setVariants(u); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 bg-white font-medium" placeholder="e.g., Black" />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Qty</label>
                    <input type="number" min="0" value={variant.inventory} onChange={(e) => { const u = [...variants]; u[index].inventory = parseInt(e.target.value) || 0; setVariants(u); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 bg-white font-medium" />
                  </div>
                  <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setVariants([...variants, { size: "", color: "", inventory: 1 }])}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 border border-dashed border-rose-300 rounded-lg hover:bg-rose-50 transition w-fit">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Size Variant
              </button>
            </div>
          </div>

          {/* Images */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Images</h2>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Image URLs
            </label>
            <div className="flex flex-col gap-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const updated = [...imageUrls];
                        updated[index] = e.target.value;
                        setImageUrls(updated);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-900 placeholder:text-gray-500 bg-white transition-all font-medium font-mono text-sm"
                      placeholder={index === 0 ? "Main image URL" : `Image URL #${index + 1}`}
                    />
                  </div>
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = imageUrls.filter((_, i) => i !== index);
                        setImageUrls(updated);
                      }}
                      className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="Remove image"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setImageUrls([...imageUrls, ""])}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 border border-dashed border-rose-300 rounded-lg hover:bg-rose-50 transition w-fit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another Image
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-base">info</span>
              First image will be the main product image.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition disabled:opacity-50 font-semibold shadow-lg shadow-rose-200"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

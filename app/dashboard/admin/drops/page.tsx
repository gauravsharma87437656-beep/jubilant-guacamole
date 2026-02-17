"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  dailyPrice: number;
  status: string;
  isFeatured: boolean;
  rentalCount: number;
  viewCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  vendor: {
    businessName: string;
  } | null;
  category: {
    name: string;
  } | null;
  brand: {
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function AdminDropsPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"drops" | "add">("drops");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    images: "",
    dailyPrice: "",
    categoryId: "",
    brandId: "",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (session?.user?.role !== "ADMIN") {
      redirect("/dashboard/customer");
    }

    fetchData();
  }, [status, session]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/categories"),
        fetch("/api/brands"),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const brandsData = await brandsRes.json();

      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
      setBrands(brandsData.brands || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentStatus }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, isFeatured: !currentStatus } : p
          )
        );
      } else {
        alert("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug,
          description: formData.description,
          images: formData.images.split(",").map((url) => url.trim()),
          dailyPrice: parseFloat(formData.dailyPrice),
          categoryId: formData.categoryId,
          brandId: formData.brandId || null,
          status: "ACTIVE",
          isFeatured: true,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({
          name: "",
          description: "",
          images: "",
          dailyPrice: "",
          categoryId: "",
          brandId: "",
        });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
    } finally {
      setCreating(false);
    }
  };

  const featuredProducts = products.filter((p) => p.isFeatured);
  const availableProducts = products.filter((p) => !p.isFeatured && p.status === "ACTIVE");

  const filteredAvailable = availableProducts.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.vendor?.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    product.brand?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Drops Management</h2>
          <p className="text-gray-500 text-sm">
            Manage featured products displayed in the &ldquo;Drops&rdquo; section on homepage
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-rose-50 px-4 py-2 rounded-lg">
            <span className="text-rose-600 font-bold">{featuredProducts.length}</span>
            <span className="text-gray-600 text-sm ml-1">in Drops</span>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            <span className="material-symbols-outlined text-[18px] mr-1">add</span>
            Create New Drop
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("drops")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "drops"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="material-symbols-outlined text-[18px] mr-1 align-middle">auto_awesome</span>
          Current Drops ({featuredProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "add"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="material-symbols-outlined text-[18px] mr-1 align-middle">add_circle</span>
          Add Existing ({availableProducts.length})
        </button>
      </div>

      {/* Current Drops Tab */}
      {activeTab === "drops" && (
        <div>
          {featuredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">auto_awesome</span>
              <h3 className="font-medium text-gray-900 mb-1">No products in Drops</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create a new product or add existing ones to the Drops section
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <span className="material-symbols-outlined text-[18px] mr-1">add</span>
                  Create New Drop
                </Button>
                <Button
                  onClick={() => setActiveTab("add")}
                  variant="outline"
                >
                  Add Existing Product
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-rose-200 rounded-xl overflow-hidden shadow-sm ring-2 ring-rose-100"
                >
                  <div className="relative h-48 bg-gray-100">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-4xl">image</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-rose-600 text-white">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                      <span className="text-sm font-bold text-gray-900">
                        ₹{Number(product.dailyPrice).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                      {product.vendor && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">store</span>
                          {product.vendor.businessName}
                        </div>
                      )}
                      {product.brand && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                          {product.brand.name}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => toggleFeatured(product.id, true)}
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-[18px] mr-1">remove</span>
                      Remove from Drops
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Products Tab */}
      {activeTab === "add" && (
        <div>
          {/* Search */}
          <div className="relative mb-6">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search products to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-600/20"
            />
          </div>

          {filteredAvailable.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inventory_2</span>
              <h3 className="font-medium text-gray-900 mb-1">No products available</h3>
              <p className="text-sm text-gray-500 mb-4">
                {search
                  ? "Try adjusting your search query"
                  : "All active products are already in Drops. Create a new product instead."}
              </p>
              {!search && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <span className="material-symbols-outlined text-[18px] mr-1">add</span>
                  Create New Drop
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAvailable.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-rose-200 transition-colors"
                >
                  <div className="relative h-48 bg-gray-100">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-4xl">image</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-green-100 text-green-600">
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                      <span className="text-sm font-bold text-gray-900">
                        ₹{Number(product.dailyPrice).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                      {product.vendor && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">store</span>
                          {product.vendor.businessName}
                        </div>
                      )}
                      {product.brand && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                          {product.brand.name}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        {product.viewCount} views • {product.rentalCount} rentals
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        toggleFeatured(product.id, false);
                      }}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      <span className="material-symbols-outlined text-[18px] mr-1">add</span>
                      Add to Drops
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Create New Drop</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Create a new product and automatically add it to Drops
              </p>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/20"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/20"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URLs (comma separated) *
                </label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/20"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.dailyPrice}
                  onChange={(e) => setFormData({ ...formData, dailyPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/20"
                  placeholder="Enter daily rental price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/20"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600/20"
                >
                  <option value="">Select a brand (optional)</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-rose-50 p-3 rounded-lg">
                <p className="text-sm text-rose-600">
                  <span className="material-symbols-outlined text-[16px] align-middle mr-1">info</span>
                  This product will be automatically added to Drops and visible on the homepage.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {creating ? "Creating..." : "Create & Add to Drops"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

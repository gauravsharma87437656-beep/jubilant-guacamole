"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Eye, Edit, Trash2, Power, MoreVertical, Star, Calendar } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  status: string;
  dailyPrice: number;
  viewCount: number;
  rentalCount: number;
  rating: number;
  createdAt: string;
  category: {
    name: string;
  };
}

export default function VendorProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = statusFilter
        ? `/api/vendor/products?status=${statusFilter}`
        : "/api/vendor/products";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/vendor/products/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/vendor/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800 border-green-200",
      INACTIVE: "bg-gray-100 text-gray-800 border-gray-200",
      DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ARCHIVED: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600 mt-1">Manage your rental products</p>
        </div>
        <Link
          href="/dashboard/vendor/products/add"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-sm gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500 bg-white shadow-sm transition-all"
          />
        </div>
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-500" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm appearance-none cursor-pointer font-medium"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m8-4l8 4m-8-4v10m0 0l8-4m-8 4l-8-4" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-bold text-gray-900">No products found</h3>
          <p className="mt-1 text-gray-500 max-w-sm mx-auto">
            {searchQuery || statusFilter ? "Try adjusting your filters." : "Get started by adding your first product to the platform."}
          </p>
          {!searchQuery && !statusFilter && (
            <Link
              href="/dashboard/vendor/products/add"
              className="mt-6 inline-flex px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-sm"
            >
              Add New Product
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="aspect-w-16 aspect-h-10 bg-gray-100 relative group">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-gray-300 bg-gray-50">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${getStatusColor(
                      product.status
                    )}`}
                  >
                    {product.status}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{product.category?.name}</p>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900 text-lg">
                    ₹{Number(product.dailyPrice).toLocaleString()}<span className="text-sm text-gray-500 font-medium">/day</span>
                  </span>
                  <div className="flex items-center text-sm font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 text-yellow-500 mr-1 fill-yellow-500" />
                    {Number(product.rating).toFixed(1)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-1.5 justify-center border-r border-gray-200">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{product.viewCount} views</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{product.rentalCount} rentals</span>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2">
                  <Link
                    href={`/product/${product.id}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                  <Link
                    href={`/dashboard/vendor/products/${product.id}/edit`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => toggleProductStatus(product.id, product.status)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition border ${product.status === "ACTIVE"
                        ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {product.status === "ACTIVE" ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

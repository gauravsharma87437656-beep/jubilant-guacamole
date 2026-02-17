"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
    description?: string;
    productCount: number;
}

export default function AdminCategories() {
    const { data: session, status } = useSession();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Create Form State
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        image: "",
        description: "",
    });

    // Edit State
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        slug: "",
        image: "",
        description: "",
    });
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editError, setEditError] = useState("");

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") redirect("/login");
        if (session?.user?.role !== "ADMIN") redirect("/dashboard");

        fetchCategories();
    }, [status, session]);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            slug: name === "name" && (prev.slug === "" || prev.slug === generateSlug(prev.name))
                ? generateSlug(value)
                : (name === "slug" ? value : prev.slug)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setFormData({ name: "", slug: "", image: "", description: "" });
                fetchCategories();
                toast.success("Category created successfully!");
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to create category");
            }
        } catch (error) {
            console.error("Error creating category:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    // Edit handlers
    const openEditModal = (cat: Category) => {
        setEditingCategory(cat);
        setEditForm({
            name: cat.name,
            slug: cat.slug,
            image: cat.image || "",
            description: cat.description || "",
        });
        setEditError("");
    };

    const handleEditNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setEditForm((prev) => ({ ...prev, name, slug: generateSlug(name) }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        setEditSubmitting(true);
        setEditError("");

        try {
            const res = await fetch(`/api/categories/${editingCategory.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });

            if (res.ok) {
                setEditingCategory(null);
                fetchCategories();
                toast.success("Category updated successfully!");
            } else {
                const error = await res.json();
                setEditError(error.error || "Failed to update category");
            }
        } catch (error) {
            console.error("Error updating category:", error);
            setEditError("An unexpected error occurred.");
        } finally {
            setEditSubmitting(false);
        }
    };

    // Delete handler
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchCategories();
                toast.success("Category deleted");
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to delete category");
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("An unexpected error occurred.");
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
                    <p className="text-gray-500 mt-1">Add and manage product categories.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Create Category Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Category</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-gray-900"
                                    placeholder="e.g. Wedding Dresses"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none transition-all bg-gray-50 text-gray-600"
                                    placeholder="e.g. wedding-dresses"
                                />
                                <p className="text-xs text-gray-500 mt-1">URL-friendly version of the name.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-gray-900"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-gray-900"
                                    placeholder="Optional description..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-b-transparent rounded-full animate-spin"></div>
                                        Creating...
                                    </>
                                ) : (
                                    "Create Category"
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Categories List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900">Existing Categories</h2>
                            <span className="text-sm text-gray-500">{categories.length} Categories</span>
                        </div>

                        <div className="overflow-x-auto">
                            {categories.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No categories found. Create one to get started.
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-white text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3">Image</th>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Slug</th>
                                            <th className="px-6 py-3 text-center">Products</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {categories.map((category) => (
                                            <tr key={category.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 relative overflow-hidden text-xs flex items-center justify-center text-gray-400">
                                                        {category.image ? (
                                                            <Image
                                                                src={category.image}
                                                                alt={category.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            "No Img"
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                    {category.name}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-500 font-mono text-xs">
                                                    {category.slug}
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-500 text-center">
                                                    {category.productCount}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(category)}
                                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                                            title="Edit category"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(category.id)}
                                                            className="text-gray-400 hover:text-rose-600 transition-colors"
                                                            title="Delete category"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Edit Modal */}
            {editingCategory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Edit Category</h2>
                            <p className="text-sm text-gray-500 mt-1">Editing &ldquo;{editingCategory.name}&rdquo;</p>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            {editError && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                                    {editError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.name}
                                    onChange={handleEditNameChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-gray-900 bg-white placeholder-gray-400"
                                    placeholder="e.g. Wedding Dresses"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.slug}
                                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-gray-50 text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none h-20 text-gray-900 bg-white placeholder-gray-400"
                                    placeholder="Short description..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={editForm.image}
                                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-gray-900 bg-white placeholder-gray-400"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingCategory(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSubmitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {editSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

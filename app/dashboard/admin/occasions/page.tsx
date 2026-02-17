"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Edit, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Occasion {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    productCount?: number;
    isActive: boolean;
}

export default function AdminOccasionsPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newOccasion, setNewOccasion] = useState({ name: "", slug: "", image: "", description: "" });
    const [submitError, setSubmitError] = useState("");

    // Edit state
    const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);
    const [editForm, setEditForm] = useState({ name: "", slug: "", image: "", description: "" });
    const [editError, setEditError] = useState("");

    const { data: occasions = [], isLoading } = useQuery<Occasion[]>({
        queryKey: ['admin-occasions'],
        queryFn: async () => {
            const res = await fetch('/api/occasions');
            if (!res.ok) throw new Error('Failed to fetch occasions');
            const data = await res.json();
            return data.occasions;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof newOccasion) => {
            const res = await fetch('/api/occasions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to create occasion');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-occasions'] });
            setIsCreateOpen(false);
            setNewOccasion({ name: "", slug: "", image: "", description: "" });
            setSubmitError("");
        },
        onError: (error: Error) => {
            setSubmitError(error.message);
        }
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            const res = await fetch(`/api/occasions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        onMutate: async ({ id, isActive }) => {
            await queryClient.cancelQueries({ queryKey: ['admin-occasions'] });
            const previousOccasions = queryClient.getQueryData<Occasion[]>(['admin-occasions']);
            queryClient.setQueryData<Occasion[]>(['admin-occasions'], (old) =>
                old ? old.map(occ => occ.id === id ? { ...occ, isActive } : occ) : []
            );
            return { previousOccasions };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['admin-occasions'], context?.previousOccasions);
            toast.error("Failed to update status");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-occasions'] });
        }
    });

    const editMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: typeof editForm }) => {
            const res = await fetch(`/api/occasions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update occasion');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-occasions'] });
            setEditingOccasion(null);
            setEditError("");
            toast.success("Occasion updated successfully");
        },
        onError: (error: Error) => {
            setEditError(error.message);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/occasions/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete occasion');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-occasions'] });
            toast.success("Occasion deleted");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");
        createMutation.mutate(newOccasion);
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setNewOccasion(prev => ({ ...prev, name, slug: generateSlug(name) }));
    };

    const openEditModal = (occ: Occasion) => {
        setEditingOccasion(occ);
        setEditForm({
            name: occ.name,
            slug: occ.slug,
            image: occ.image || "",
            description: "",
        });
        setEditError("");
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOccasion) return;
        setEditError("");
        editMutation.mutate({ id: editingOccasion.id, data: editForm });
    };

    const handleEditNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setEditForm(prev => ({ ...prev, name, slug: generateSlug(name) }));
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Occasions</h1>
                    <p className="text-sm text-gray-500">Manage rental occasions and events</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Occasion
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4 text-center">Active</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : occasions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No occasions found. Create one currently!
                                    </td>
                                </tr>
                            ) : (
                                occasions.map((occ) => (
                                    <tr key={occ.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 relative overflow-hidden">
                                                {/* Placeholder or image */}
                                                {occ.image ? (
                                                    <Image src={occ.image} alt={occ.name} fill className="object-cover" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{occ.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{occ.slug}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleMutation.mutate({ id: occ.id, isActive: !occ.isActive })}
                                                disabled={toggleMutation.isPending}
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${occ.isActive
                                                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                                                    } transition-colors disabled:opacity-50`}
                                            >
                                                {toggleMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                                {occ.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(occ)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Edit occasion"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this occasion?')) {
                                                            deleteMutation.mutate(occ.id);
                                                        }
                                                    }}
                                                    className="text-gray-400 hover:text-rose-600 transition-colors"
                                                    title="Delete occasion"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Create New Occasion</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {submitError && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                                    {submitError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newOccasion.name}
                                    onChange={handleNameChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-gray-900 bg-white placeholder-gray-400"
                                    placeholder="e.g. Wedding"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                <input
                                    type="text"
                                    required
                                    value={newOccasion.slug}
                                    onChange={(e) => setNewOccasion({ ...newOccasion, slug: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-gray-50 text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newOccasion.description}
                                    onChange={(e) => setNewOccasion({ ...newOccasion, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none h-20 text-gray-900 bg-white placeholder-gray-400"
                                    placeholder="Short description..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={newOccasion.image}
                                    onChange={(e) => setNewOccasion({ ...newOccasion, image: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-gray-900 bg-white placeholder-gray-400"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Occasion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingOccasion && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Edit Occasion</h2>
                            <p className="text-sm text-gray-500 mt-1">Editing &ldquo;{editingOccasion.name}&rdquo;</p>
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
                                    placeholder="e.g. Wedding"
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
                                    onClick={() => setEditingOccasion(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editMutation.isPending}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {editMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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

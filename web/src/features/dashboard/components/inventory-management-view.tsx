"use client";

import React, { useState } from "react";
import { Poster } from "@/types";
import {
  useGetAllInventoryQuery,
  useSoftDeleteInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useUpdateInventoryItemMutation,
} from "@/store/api/inventory.api";
import { PosterFormModal } from "./poster-form-modal";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Layers,
  Sparkles,
  Power,
} from "lucide-react";

export const InventoryManagementView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null);

  const { data, isLoading, refetch } = useGetAllInventoryQuery({
    page,
    limit: 8,
    filters: {
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
    },
  });

  const [softDelete] = useSoftDeleteInventoryItemMutation();
  const [hardDelete] = useDeleteInventoryItemMutation();
  const [updatePoster] = useUpdateInventoryItemMutation();

  const posters = data?.data?.posters || [];
  const pagination = data?.data?.pagination;

  const handleOpenCreateModal = () => {
    setEditingPoster(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (poster: Poster) => {
    setEditingPoster(poster);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (poster: Poster) => {
    const isActivating = !poster.isAvailable;
    try {
      if (isActivating) {
        await updatePoster({
          id: poster._id,
          updateDetails: { isAvailable: true },
        }).unwrap();
        toast.success(`Poster "${poster.title}" activated successfully.`);
      } else {
        await softDelete(poster._id).unwrap();
        toast.success(`Poster "${poster.title}" deactivated successfully.`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${isActivating ? "activate" : "deactivate"} poster.`);
    }
  };

  const handleHardDelete = async (poster: Poster) => {
    if (confirm(`PERMANENT DELETE: Are you sure you want to permanently delete "${poster.title}" from the database?`)) {
      try {
        await hardDelete(poster._id).unwrap();
        toast.success(`Poster "${poster.title}" permanently deleted.`);
      } catch (err: any) {
        toast.error("Failed to delete poster.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Inventory Management</h2>
            <p className="text-xs text-muted-foreground">
              Manage product catalog, prices, stock levels, and artwork uploads
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Poster</span>
        </button>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search poster title, tags, or description..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 text-sm transition-all shadow-md"
          />
        </div>

        <select
          value={selectedCategory || ""}
          onChange={(e) => {
            setSelectedCategory(e.target.value || undefined);
            setPage(1);
          }}
          className="px-4 py-3 rounded-2xl bg-card border border-border/40 text-foreground text-sm focus:outline-none focus:border-amber-500 transition-all shadow-md"
        >
          <option value="">All Categories</option>
          <option value="Anime">Anime</option>
          <option value="Movies">Movies</option>
          <option value="Gaming">Gaming</option>
          <option value="Abstract">Abstract</option>
          <option value="Nature">Nature</option>
          <option value="Vintage">Vintage</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="rounded-3xl bg-card border border-border/40 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Loading catalog items...</p>
          </div>
        ) : posters.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-3">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-semibold">No posters found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Poster</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Dimensions</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {posters.map((poster) => (
                  <tr key={poster._id} className="hover:bg-secondary/20 transition-colors">
                    {/* Poster Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-11 rounded-xl overflow-hidden bg-secondary border border-border/40 flex-shrink-0">
                          {poster.images?.[0]?.url ? (
                            <img
                              src={poster.images[0].url}
                              alt={poster.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground m-auto" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground line-clamp-1">{poster.title}</p>
                          <div className="flex gap-1">
                            {poster.tags?.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {poster.category}
                      </span>
                    </td>

                    {/* Dimensions */}
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {poster.dimensions}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-extrabold text-foreground">
                      ${poster.price.toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold text-xs ${
                          poster.stock === 0
                            ? "text-rose-400 font-bold"
                            : poster.stock <= 5
                            ? "text-amber-400 font-bold"
                            : "text-emerald-400 font-bold"
                        }`}
                      >
                        {poster.stock} units
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {poster.isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="h-3.5 w-3.5" />
                          Disabled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(poster)}
                          title="Edit Poster"
                          className="p-2 rounded-xl bg-secondary hover:bg-amber-500/20 text-muted-foreground hover:text-amber-400 transition-all cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(poster)}
                          title={poster.isAvailable ? "Deactivate Poster" : "Activate Poster"}
                          className={`p-2 rounded-xl bg-secondary transition-all cursor-pointer ${
                            poster.isAvailable
                              ? "hover:bg-yellow-500/20 text-muted-foreground hover:text-yellow-400"
                              : "hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-400"
                          }`}
                        >
                          {poster.isAvailable ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleHardDelete(poster)}
                          title="Delete Permanently"
                          className="p-2 rounded-xl bg-secondary hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-border/40 bg-secondary/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-40 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Create / Edit */}
      <PosterFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        posterToEdit={editingPoster}
      />
    </div>
  );
};

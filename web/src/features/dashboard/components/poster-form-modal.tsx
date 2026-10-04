"use client";

import React, { useState, useEffect } from "react";
import { Poster } from "@/types";
import {
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
} from "@/store/api/inventory.api";
import { toast } from "sonner";
import {
  X,
  Upload,
  Trash2,
  Package,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface PosterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  posterToEdit?: Poster | null;
}

const CATEGORIES = [
  "Anime",
  "Movies",
  "Gaming",
  "Abstract",
  "Nature",
  "Vintage",
  "Minimalist",
  "Cyberpunk",
  "Sci-Fi",
];

export const PosterFormModal: React.FC<PosterFormModalProps> = ({
  isOpen,
  onClose,
  posterToEdit,
}) => {
  const isEditing = Boolean(posterToEdit);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [dimensions, setDimensions] = useState("24x36 inches");
  const [price, setPrice] = useState<number>(29.99);
  const [stock, setStock] = useState<number>(50);
  const [material, setMaterial] = useState("Premium Matte Paper (250gsm)");
  const [isAvailable, setIsAvailable] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const [createPoster, { isLoading: isCreating }] = useCreateInventoryItemMutation();
  const [updatePoster, { isLoading: isUpdating }] = useUpdateInventoryItemMutation();

  useEffect(() => {
    if (posterToEdit) {
      setTitle(posterToEdit.title || "");
      setDescription(posterToEdit.description || "");
      setCategory(posterToEdit.category || CATEGORIES[0]);
      setDimensions(posterToEdit.dimensions || "24x36 inches");
      setPrice(posterToEdit.price ?? 0);
      setStock(posterToEdit.stock ?? 0);
      setMaterial("Premium Matte Paper (250gsm)");
      setIsAvailable(
        posterToEdit.isAvailable === true ||
          String(posterToEdit.isAvailable) === "true"
      );
      setTags(posterToEdit.tags || []);
      setImagePreviews(posterToEdit.images?.map((img) => img.url) || []);
      setImagesToDelete([]);
      setImageFiles([]);
    } else {
      resetForm();
    }
  }, [posterToEdit, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    setDimensions("24x36 inches");
    setPrice(29.99);
    setStock(50);
    setMaterial("Premium Matte Paper (250gsm)");
    setIsAvailable(true);
    setTags(["Poster", "Art"]);
    setImageFiles([]);
    setImagePreviews([]);
    setImagesToDelete([]);
  };

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveExistingImage = (publicId: string, index: number) => {
    if (publicId) {
      setImagesToDelete((prev) => [...prev, publicId]);
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Poster title is required.");
      return;
    }
    if (price <= 0) {
      toast.error("Price must be greater than zero.");
      return;
    }

    try {
      if (isEditing && posterToEdit) {
        await updatePoster({
          id: posterToEdit._id,
          images: imageFiles,
          updateDetails: {
            title,
            description,
            category,
            dimensions,
            price: Number(price),
            stock: Number(stock),
            isAvailable,
            tags,
            material,
            imagesToDelete,
          },
        }).unwrap();
        toast.success("Poster updated successfully!");
      } else {
        if (imageFiles.length === 0) {
          toast.error("Please upload at least one image for the new poster.");
          return;
        }
        await createPoster({
          images: imageFiles,
          itemDetails: {
            title,
            description,
            category,
            dimensions,
            price: Number(price),
            stock: Number(stock),
            isAvailable,
            tags,
            material,
          },
        }).unwrap();
        toast.success("New poster created successfully!");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to save poster.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-card border border-border/50 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isEditing ? "Edit Poster" : "Create New Poster"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEditing
                  ? "Update inventory details and product images"
                  : "Add a new artwork to your store catalog"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Poster Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neon Cyberpunk Cityscape"
                className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/50 text-foreground focus:outline-none focus:border-amber-500 transition-all text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-card text-foreground">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dimensions
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 24x36 inches"
                className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/50 text-foreground focus:outline-none focus:border-amber-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/50 text-foreground focus:outline-none focus:border-amber-500 transition-all text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/50 text-foreground focus:outline-none focus:border-amber-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="High quality museum grade poster print details..."
              className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 transition-all text-sm resize-none"
            />
          </div>

          {/* Material & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Material / Paper Grade
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. 250gsm Premium Glossy"
                className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/50 text-foreground focus:outline-none focus:border-amber-500 transition-all text-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border/30">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Store Status
              </span>
              {isAvailable ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Available for Purchase (Active)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <XCircle className="h-3.5 w-3.5" />
                  Disabled in Store
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tags / Keywords
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag and press Enter"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-secondary/40 border border-border/50 text-foreground text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"
                >
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-400">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-3 border-t border-border/40 pb-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Poster Images (Cloudinary Upload)
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group aspect-[3/4] rounded-2xl overflow-hidden border border-border/40 bg-secondary/30">
                  <img src={preview} alt="Poster preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      const existingImg = posterToEdit?.images?.[index];
                      if (existingImg) {
                        handleRemoveExistingImage(existingImg.public_id, index);
                      } else {
                        handleRemoveNewFile(index);
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-xl bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center aspect-[3/4] rounded-2xl border-2 border-dashed border-border/60 hover:border-amber-500/60 bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-all">
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground font-medium text-center px-1">
                  Upload Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{isEditing ? "Update Poster" : "Create Poster"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

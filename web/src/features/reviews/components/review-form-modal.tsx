"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Review,
  useCreateReviewMutation,
  useUpdateReviewMutation,
} from "@/store/api/review.api";
import { RatingStars } from "./rating-stars";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Upload, X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  posterId: string;
  editingReview?: Review | null;
}

export function ReviewFormModal({
  isOpen,
  onClose,
  posterId,
  editingReview,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string; public_id: string }[]>([]);
  const [deleteImagePublicIds, setDeleteImagePublicIds] = useState<string[]>([]);

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating || 5);
      setComment(editingReview.comment || "");
      setExistingImages(editingReview.images || []);
      setDeleteImagePublicIds([]);
    } else {
      setRating(5);
      setComment("");
      setExistingImages([]);
      setDeleteImagePublicIds([]);
    }
    setSelectedFiles([]);
    setPreviewUrls([]);
  }, [editingReview, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      const newPreviewUrls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const handleRemoveNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (publicId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.public_id !== publicId));
    setDeleteImagePublicIds((prev) => [...prev, publicId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars.");
      return;
    }

    try {
      if (editingReview) {
        // Edit existing review
        await updateReview({
          reviewId: editingReview._id,
          posterId,
          rating,
          comment,
          images: selectedFiles.length > 0 ? selectedFiles : undefined,
          deleteImagePublicIds: deleteImagePublicIds.length > 0 ? deleteImagePublicIds : undefined,
        }).unwrap();

        toast.success("Review updated successfully!");
      } else {
        // Create new review
        await createReview({
          posterId,
          rating,
          comment,
          images: selectedFiles.length > 0 ? selectedFiles : undefined,
        }).unwrap();

        toast.success("Review published successfully!");
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit review.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border/50 text-foreground p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-black tracking-tight">
              {editingReview ? "Edit Your Review" : "Write a Customer Review"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Share your thoughts and upload photos of your new wall art print!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Star Selector */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-secondary/30 border border-border/40 text-center">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Overall Rating
            </label>
            <div className="flex justify-center pt-1">
              <RatingStars
                rating={rating}
                size="lg"
                interactive={true}
                onRatingChange={setRating}
                hoverRating={hoverRating}
                onHoverChange={setHoverRating}
              />
            </div>
          </div>

          {/* Comment Text Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">
              Your Review Comment
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like about this poster? How is the paper quality and print colors?"
              className="w-full p-3.5 rounded-2xl bg-secondary/50 border border-border/50 text-foreground text-xs font-medium focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Image Attachments */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground block">
              Attach Photos (Optional)
            </label>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Existing Images (When Editing) */}
              {existingImages.map((img) => (
                <div key={img.public_id} className="relative aspect-square w-16 rounded-xl overflow-hidden bg-secondary border border-border/40">
                  <Image src={img.url} alt="Review attachment" fill className="object-cover" sizes="64px" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(img.public_id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:bg-rose-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Newly Uploaded Previews */}
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square w-16 rounded-xl overflow-hidden bg-secondary border border-border/40">
                  <Image src={url} alt="New attachment preview" fill className="object-cover" sizes="64px" />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white hover:bg-rose-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Add Photo Button */}
              <label className="aspect-square w-16 rounded-xl border-2 border-dashed border-border/60 hover:border-amber-500/50 bg-secondary/20 flex flex-col items-center justify-center cursor-pointer transition-colors text-muted-foreground hover:text-amber-500">
                <Upload className="h-4 w-4" />
                <span className="text-[9px] font-bold mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publishing Review...</span>
              </>
            ) : (
              <span>{editingReview ? "Update Review" : "Post Review"}</span>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

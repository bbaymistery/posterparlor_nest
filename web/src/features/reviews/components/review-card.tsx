"use client";

import { useState } from "react";
import Image from "next/image";
import { Review, useDeleteReviewMutation } from "@/store/api/review.api";
import { RatingStars } from "./rating-stars";
import { Trash2, Edit3, ShieldCheck, User, ZoomIn, Loader2 } from "lucide-react";
import { useAppSelector } from "@/store";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ReviewCardProps {
  review: Review;
  posterId: string;
  onEditClick: (review: Review) => void;
}

export function ReviewCard({ review, posterId, onEditClick }: ReviewCardProps) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Author or Admin check
  const isAuthor =
    currentUser && currentUser.id === review.userId?._id;
  const isAdmin = currentUser?.role === "ADMIN";
  const canManage = isAuthor || isAdmin;

  const reviewerName = review.userId?.name || "Verified Customer";
  const initial = reviewerName.charAt(0).toUpperCase();

  const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await deleteReview({ reviewId: review._id, posterId }).unwrap();
      toast.success("Review deleted successfully.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete review.");
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-card border border-border/40 space-y-3.5 transition-all hover:border-border">
      {/* Header: User Info & Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 font-bold text-white text-xs shadow-md">
            {initial}
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span>{reviewerName}</span>
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" /> Verified Buyer
              </span>
            </h4>
            <span className="text-[11px] text-muted-foreground font-mono">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Rating & Actions */}
        <div className="flex items-center gap-3">
          <RatingStars rating={review.rating} size="sm" />

          {canManage && (
            <div className="flex items-center gap-1 border-l border-border/40 pl-2">
              {isAuthor && (
                <button
                  onClick={() => onEditClick(review)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  title="Edit Review"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-30"
                title="Delete Review"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comment Body */}
      {review.comment && (
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-1">
          "{review.comment}"
        </p>
      )}

      {/* Review Image Attachments */}
      {review.images && review.images.length > 0 && (
        <div className="flex items-center gap-2 pt-2 flex-wrap">
          {review.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setPreviewImageUrl(img.url)}
              className="relative aspect-square w-16 rounded-xl overflow-hidden bg-secondary border border-border/40 group hover:opacity-90 transition-opacity"
            >
              <Image
                src={img.url}
                alt="Customer review attachment"
                fill
                className="object-cover"
                sizes="64px"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ZoomIn className="h-4 w-4 text-white" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Image Zoom Modal */}
      {previewImageUrl && (
        <Dialog open={!!previewImageUrl} onOpenChange={() => setPreviewImageUrl(null)}>
          <DialogContent className="max-w-2xl bg-black/90 border-border/40 p-2 overflow-hidden rounded-2xl">
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
            <div className="relative aspect-square sm:aspect-video w-full rounded-xl overflow-hidden">
              <Image
                src={previewImageUrl}
                alt="Enlarged review photo"
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

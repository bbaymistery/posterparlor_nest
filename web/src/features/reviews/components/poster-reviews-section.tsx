"use client";

import { useState } from "react";
import { useGetProductReviewsQuery, Review } from "@/store/api/review.api";
import { ReviewStatsSummary } from "./review-stats-summary";
import { ReviewCard } from "./review-card";
import { ReviewFormModal } from "./review-form-modal";
import { AuthModal } from "@/features/auth/components/auth-modal";
import { useAppSelector } from "@/store";
import { MessageSquare, Star, Filter, ArrowUpDown, Loader2, Sparkles } from "lucide-react";

interface PosterReviewsSectionProps {
  posterId: string;
}

export function PosterReviewsSection({ posterId }: PosterReviewsSectionProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [sort, setSort] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [hasImageFilter, setHasImageFilter] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const { data, isLoading, isError } = useGetProductReviewsQuery({
    posterId,
    page,
    limit: 5,
    sort,
    rating: ratingFilter,
    hasImage: hasImageFilter || undefined,
  });

  const reviews = data?.data?.reviews || data?.reviews || [];
  const stats = data?.data?.stats || data?.stats || { averageRating: 0, totalReviews: 0, ratingDistribution: {} };
  const pagination = data?.data?.pagination || data?.pagination;

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingReview(null);
    setIsFormModalOpen(true);
  };

  const handleEditReviewClick = (review: Review) => {
    setEditingReview(review);
    setIsFormModalOpen(true);
  };

  return (
    <section className="pt-12 border-t border-border/40 space-y-8">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Customer Reviews
            </h2>
            <p className="text-xs text-muted-foreground">
              Real feedback and photos from verified buyers
            </p>
          </div>
        </div>
      </div>

      {/* Review Stats Summary Header */}
      <ReviewStatsSummary
        stats={stats}
        onWriteReviewClick={handleWriteReviewClick}
      />

      {/* Filters & Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/40 text-xs">
        
        {/* Rating Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-muted-foreground flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>

          <button
            onClick={() => { setRatingFilter(undefined); setHasImageFilter(false); setPage(1); }}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
              ratingFilter === undefined && !hasImageFilter
                ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({stats.totalReviews})
          </button>

          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => { setRatingFilter(star); setHasImageFilter(false); setPage(1); }}
              className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 transition-all ${
                ratingFilter === star
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{star}</span>
              <Star className={`h-3 w-3 ${ratingFilter === star ? "fill-black" : "fill-amber-400 text-amber-400"}`} />
            </button>
          ))}

          <button
            onClick={() => { setHasImageFilter(!hasImageFilter); setRatingFilter(undefined); setPage(1); }}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
              hasImageFilter
                ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            With Photos
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as any); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-secondary border border-border/50 text-foreground font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Review Cards List */}
      {isLoading ? (
        <div className="py-12 flex items-center justify-center text-muted-foreground gap-2 font-medium text-xs">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          <span>Loading customer reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-card/30 border border-border/40 space-y-3">
          <div className="p-3 rounded-full bg-secondary text-muted-foreground">
            <Sparkles className="h-6 w-6 text-amber-500/60" />
          </div>
          <h4 className="font-bold text-base text-foreground">No reviews found</h4>
          <p className="text-xs text-muted-foreground max-w-xs">
            Be the first customer to leave a review and share your photos!
          </p>
          <button
            onClick={handleWriteReviewClick}
            className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
          >
            Write First Review
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              posterId={posterId}
              onEditClick={handleEditReviewClick}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 text-xs font-semibold">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrevPage}
            className="px-4 py-2 rounded-xl bg-secondary text-foreground border border-border/40 disabled:opacity-30 hover:bg-secondary/80 transition-colors"
          >
            Previous
          </button>
          <span className="font-mono text-muted-foreground px-2">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 rounded-xl bg-secondary text-foreground border border-border/40 disabled:opacity-30 hover:bg-secondary/80 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Review Form Modal */}
      <ReviewFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        posterId={posterId}
        editingReview={editingReview}
      />

      {/* Auth Modal (For Guest Users) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </section>
  );
}

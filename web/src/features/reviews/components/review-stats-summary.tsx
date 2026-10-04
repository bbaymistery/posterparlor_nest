"use client";

import { ReviewStats } from "@/store/api/review.api";
import { RatingStars } from "./rating-stars";
import { MessageSquarePlus, Star } from "lucide-react";

interface ReviewStatsSummaryProps {
  stats: ReviewStats;
  onWriteReviewClick: () => void;
}

export function ReviewStatsSummary({
  stats,
  onWriteReviewClick,
}: ReviewStatsSummaryProps) {
  const { averageRating = 0, totalReviews = 0, ratingDistribution = {} } = stats || {};

  return (
    <div className="p-6 rounded-3xl bg-card border border-border/40 space-y-6 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Rating Big Badge */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 min-w-[100px]">
            <span className="text-4xl font-black text-amber-400 font-mono leading-none">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">
              Out of 5
            </span>
          </div>

          <div className="space-y-1">
            <RatingStars rating={Math.round(averageRating)} size="lg" />
            <p className="text-xs text-muted-foreground font-medium">
              Based on <strong>{totalReviews}</strong> customer {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>

        {/* Write a Review Button */}
        <button
          onClick={onWriteReviewClick}
          className="flex items-center gap-2 py-3 px-6 rounded-2xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Star Breakdown Progress Bars */}
      <div className="space-y-2 pt-4 border-t border-border/30">
        {[5, 4, 3, 2, 1].map((starNum) => {
          const count = ratingDistribution[starNum] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={starNum} className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-muted-foreground w-12 flex items-center gap-1 font-mono">
                {starNum} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </span>

              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="font-mono text-muted-foreground text-[11px] w-10 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  hoverRating?: number | null;
  onHoverChange?: (rating: number | null) => void;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  hoverRating,
  onHoverChange,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  const currentDisplayRating = hoverRating !== undefined && hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= currentDisplayRating;

        return (
          <button
            key={index}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(starValue)}
            onMouseEnter={() => interactive && onHoverChange?.(starValue)}
            onMouseLeave={() => interactive && onHoverChange?.(null)}
            className={`${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform p-0.5"
                : "cursor-default"
            }`}
            title={`${starValue} out of ${maxRating} stars`}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors ${
                isFilled
                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                  : "text-muted-foreground/30 fill-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

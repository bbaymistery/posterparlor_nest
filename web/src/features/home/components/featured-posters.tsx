"use client";

import Link from "next/link";
import { useGetFeaturedPostersQuery, Poster } from "@/store/api/inventory.api";
import { PosterCard, PosterGridSkeleton } from "@/features/posters/components";
import { Sparkles, ArrowRight } from "lucide-react";

export function FeaturedPosters() {
  const { data, isLoading } = useGetFeaturedPostersQuery(undefined);

  // Response can be array of posters or nested array
  const rawData = data?.data;
  const featuredPosters: Poster[] = Array.isArray(rawData)
    ? rawData.flat().slice(0, 4)
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Featured Posters
          </h2>
        </div>

        <Link
          href="/posters"
          className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors"
        >
          <span>View All Posters</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Grid */}
      {isLoading ? (
        <PosterGridSkeleton count={4} />
      ) : featuredPosters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPosters.map((poster) => (
            <PosterCard key={poster._id} poster={poster} />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-card border border-border/40 text-center text-xs text-muted-foreground">
          No featured posters available. Explore the full catalog below!
        </div>
      )}
    </div>
  );
}

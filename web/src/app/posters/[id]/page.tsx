"use client";

import { use } from "react";
import Link from "next/link";
import { useGetInventoryItemByIdQuery } from "@/store/api/inventory.api";
import { PosterGallery, PosterSpecs } from "@/features/poster-detail/components";
import { PosterReviewsSection } from "@/features/reviews/components/poster-reviews-section";
import { ArrowLeft, Loader2, PackageSearch } from "lucide-react";

interface PosterDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PosterDetailPage({ params }: PosterDetailPageProps) {
  const { id } = use(params);
  const { data, isLoading, isError } = useGetInventoryItemByIdQuery(id);

  const poster = data?.data;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-8 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
        <p className="text-xs text-muted-foreground font-medium">
          Loading poster specifications...
        </p>
      </div>
    );
  }

  if (isError || !poster) {
    return (
      <div className="container mx-auto px-4 sm:px-8 py-20 flex flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4 border border-rose-500/20">
          <PackageSearch className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Poster Not Found
        </h2>
        <p className="text-xs text-muted-foreground max-w-sm mb-6">
          The requested poster item could not be retrieved or does not exist.
        </p>
        <Link
          href="/posters"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-6xl space-y-12">
      {/* Back to Catalog Link */}
      <Link
        href="/posters"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-amber-500 transition-colors mb-2 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Catalog</span>
      </Link>

      {/* Product Detail Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <PosterGallery images={poster.images} title={poster.title} />
        <PosterSpecs poster={poster} />
      </div>

      {/* Customer Reviews Section */}
      <PosterReviewsSection posterId={poster._id} />
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { PosterImage } from "@/store/api/inventory.api";

interface PosterGalleryProps {
  images: PosterImage[];
  title: string;
}

export function PosterGallery({ images, title }: PosterGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const activeImageUrl =
    images && images.length > 0
      ? images[selectedImageIndex]?.url || images[0].url
      : "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Preview */}
      <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-secondary/30 border border-border/40 shadow-2xl">
        <Image
          src={activeImageUrl}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-all duration-300"
        />
      </div>

      {/* Thumbnails Gallery */}
      {images && images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={img._id || index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative h-20 w-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                selectedImageIndex === index
                  ? "border-amber-500 scale-105 shadow-md"
                  : "border-border/40 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

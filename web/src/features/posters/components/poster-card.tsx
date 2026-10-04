"use client";

import Link from "next/link";
import Image from "next/image";
import { Poster } from "@/store/api/inventory.api";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cart.slice";
import { ShoppingBag, Eye, Sparkles, Check, PackageX } from "lucide-react";
import { toast } from "sonner";

interface PosterCardProps {
  poster: Poster;
}

export function PosterCard({ poster }: PosterCardProps) {
  const dispatch = useAppDispatch();

  // Get primary image or placeholder
  const primaryImage =
    poster.images && poster.images.length > 0
      ? poster.images[0].url
      : "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!poster.isAvailable || poster.stock <= 0) {
      toast.error("This poster is currently out of stock.");
      return;
    }

    dispatch(
      addToCart({
        _id: poster._id,
        posterId: poster._id,
        title: poster.title,
        price: poster.price,
        imageUrl: primaryImage,
        stock: poster.stock,
        quantity: 1,
        dimensions: poster.dimensions || "",
        material: "250 GSM Premium Matte",
      })
    );


    toast.success(`Added "${poster.title}" to cart!`);
  };

  return (
    <div className="group relative rounded-2xl border border-border/40 bg-card hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 flex flex-col overflow-hidden">
      
      {/* Image Container with Badges */}
      <Link href={`/posters/${poster._id}`} className="relative aspect-[3/4] w-full overflow-hidden bg-secondary/30 block">
        <Image
          src={primaryImage}
          alt={poster.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-black/60 backdrop-blur-md text-amber-400 border border-amber-500/20 shadow-md">
          {poster.category}
        </span>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {poster.isAvailable && poster.stock > 0 ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/80 backdrop-blur-md text-white shadow-md">
              <Check className="h-3 w-3" /> In Stock ({poster.stock})
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/80 backdrop-blur-md text-white shadow-md">
              <PackageX className="h-3 w-3" /> Out of Stock
            </span>
          )}
        </div>

        {/* Hover Overlay with Quick Action Buttons */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <span className="p-3 rounded-full bg-background/90 text-foreground hover:bg-amber-500 hover:text-black transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg">
            <Eye className="h-5 w-5" />
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium mb-1">
            <span>{poster.dimensions || "Standard Size"}</span>
            {poster.tags && poster.tags.length > 0 && (
              <span className="truncate max-w-[100px]">#{poster.tags[0]}</span>
            )}
          </div>

          <Link href={`/posters/${poster._id}`}>
            <h3 className="font-bold text-sm tracking-tight text-foreground hover:text-amber-500 transition-colors line-clamp-1">
              {poster.title}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
            {poster.description}
          </p>
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-auto">
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Price
            </span>
            <span className="text-lg font-black text-amber-500 font-mono">
              ${poster.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!poster.isAvailable || poster.stock <= 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-secondary/80 text-foreground hover:bg-amber-500 hover:text-black transition-all disabled:opacity-40 disabled:hover:bg-secondary cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

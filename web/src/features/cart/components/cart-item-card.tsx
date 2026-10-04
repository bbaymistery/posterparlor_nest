"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useAppDispatch } from "@/store";
import {
  CartItem,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from "@/store/slices/cart.slice";

interface CartItemCardProps {
  item: CartItem;
  isCompact?: boolean;
}

export function CartItemCard({ item, isCompact = false }: CartItemCardProps) {
  const dispatch = useAppDispatch();

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/40 transition-all hover:border-amber-500/20 ${
        isCompact ? "p-3" : "p-4"
      }`}
    >
      {/* Poster Image Thumbnail */}
      <Link
        href={`/posters/${item.posterId}`}
        className="relative aspect-[2/3] w-16 sm:w-20 rounded-xl overflow-hidden bg-secondary border border-border/40 flex-shrink-0 hover:opacity-90 transition-opacity"
      >
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover"
          sizes="80px"
        />
      </Link>

      {/* Details & Controls */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch gap-2">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/posters/${item.posterId}`}
              className="font-bold text-sm text-foreground line-clamp-1 hover:text-amber-500 transition-colors"
            >
              {item.title}
            </Link>
            <button
              onClick={() => dispatch(removeFromCart(item.posterId))}
              className="text-muted-foreground hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-500/10"
              title="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            {item.dimensions} • {item.material}
          </p>
        </div>

        {/* Quantity Controls & Price */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/20">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/60 border border-border/40">
            <button
              onClick={() => dispatch(decrementQuantity(item.posterId))}
              disabled={item.quantity <= 1}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono font-bold text-xs min-w-[20px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => dispatch(incrementQuantity(item.posterId))}
              disabled={item.quantity >= item.stock}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted-foreground font-mono block">
              ${item.price.toFixed(2)} each
            </span>
            <span className="font-mono font-black text-sm text-amber-500">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

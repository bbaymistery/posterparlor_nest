"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft, Trash2, PackageOpen, Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectCartItems,
  selectCartTotalItems,
  clearCart,
} from "@/store/slices/cart.slice";
import { CartItemCard } from "@/features/cart/components/cart-item-card";
import { CartSummary } from "@/features/cart/components/cart-summary";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectCartTotalItems);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <div>
          <Link
            href="/posters"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-amber-500 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <span>Shopping Cart</span>
            {totalItems > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            )}
          </h1>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => dispatch(clearCart())}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-rose-500 transition-colors px-3 py-2 rounded-xl hover:bg-rose-500/10 border border-border/40 hover:border-rose-500/20"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {/* Main Grid Content */}
      {items.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center rounded-3xl bg-card/40 border border-border/40 space-y-6 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-secondary border border-border/40 flex items-center justify-center text-muted-foreground">
            <PackageOpen className="h-10 w-10 text-muted-foreground/60" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Your shopping cart is empty</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Looks like you haven't added any posters to your cart yet. Browse our full catalog to find stunning artwork for your space!
            </p>
          </div>

          <Link
            href="/posters"
            className="inline-flex items-center gap-2 py-3.5 px-8 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>Explore Poster Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                Item Details ({items.length} unique)
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <CartItemCard key={item.posterId} item={item} isCompact={false} />
              ))}
            </div>
          </div>

          {/* Right: Sticky Order Summary */}
          <div className="lg:col-span-5 sticky top-24">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
}

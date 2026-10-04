"use client";

import Link from "next/link";
import { ShoppingBag, Trash2, ArrowRight, PackageOpen } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectCartItems,
  selectCartTotalItems,
  clearCart,
} from "@/store/slices/cart.slice";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CartItemCard } from "./cart-item-card";
import { CartSummary } from "./cart-summary";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectCartTotalItems);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full w-full sm:max-w-md p-0 bg-background border-l border-border/40">
        {/* Drawer Header */}
        <SheetHeader className="p-5 border-b border-border/40 flex flex-row items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                Your Cart
              </SheetTitle>
              <p className="text-xs text-muted-foreground font-mono">
                {totalItems} {totalItems === 1 ? "item" : "items"} selected
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => dispatch(clearCart())}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-500 transition-colors py-1 px-2.5 rounded-lg hover:bg-rose-500/10"
              title="Clear all items"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </SheetHeader>

        {/* Drawer Body (Item List or Empty State) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
              <div className="w-16 h-16 rounded-full bg-secondary/80 border border-border/40 flex items-center justify-center text-muted-foreground">
                <PackageOpen className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">Your cart is empty</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                  Explore our curated high-quality poster catalog and add your favorites!
                </p>
              </div>
              <Link
                href="/posters"
                onClick={() => onOpenChange(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <CartItemCard key={item.posterId} item={item} isCompact={true} />
            ))
          )}
        </div>

        {/* Drawer Footer (Summary & Page Link) */}
        {items.length > 0 && (
          <div className="p-5 border-t border-border/40 space-y-3 bg-card/40">
            <CartSummary onCheckoutClick={() => onOpenChange(false)} isCompact={true} />

            <Link
              href="/cart"
              onClick={() => onOpenChange(false)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-secondary text-foreground text-xs font-bold hover:bg-secondary/80 transition-colors border border-border/40"
            >
              <span>View Full Shopping Cart Page</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

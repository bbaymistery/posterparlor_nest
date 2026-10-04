"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, ShoppingBag } from "lucide-react";
import { useAppSelector } from "@/store";
import { selectCartSubtotal, selectCartTotalItems } from "@/store/slices/cart.slice";

interface CartSummaryProps {
  onCheckoutClick?: () => void;
  isCompact?: boolean;
}

export const FREE_SHIPPING_THRESHOLD = 50;
export const FLAT_SHIPPING_FEE = 5.0;

export function CartSummary({ onCheckoutClick, isCompact = false }: CartSummaryProps) {
  const subtotal = useAppSelector(selectCartSubtotal);
  const totalItems = useAppSelector(selectCartTotalItems);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : FLAT_SHIPPING_FEE;
  const grandTotal = subtotal + shippingFee;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-card border border-border/40">
      <h3 className="font-bold text-base text-foreground flex items-center justify-between">
        <span>Order Summary</span>
        <span className="text-xs font-mono font-medium text-muted-foreground">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </h3>

      {/* Free Shipping Progress Bar */}
      <div className="p-3 rounded-xl bg-secondary/60 border border-border/30">
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
          <span className="flex items-center gap-1.5 text-amber-500">
            <Truck className="h-3.5 w-3.5" />
            {isFreeShipping ? (
              <span className="text-emerald-400">You earned FREE Shipping! 🎉</span>
            ) : (
              <span>
                Add <strong className="font-mono">${amountNeededForFreeShipping.toFixed(2)}</strong> for FREE Shipping
              </span>
            )}
          </span>
          <span className="font-mono text-muted-foreground">{Math.round(freeShippingProgress)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isFreeShipping ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Price Details */}
      <div className="space-y-2 pt-2 border-t border-border/20 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-mono font-semibold text-foreground">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Estimated Shipping</span>
          <span className="font-mono font-semibold">
            {isFreeShipping ? (
              <span className="text-emerald-400 uppercase font-bold text-xs">FREE</span>
            ) : (
              `$${FLAT_SHIPPING_FEE.toFixed(2)}`
            )}
          </span>
        </div>
        
        <div className="flex justify-between text-base font-bold text-foreground pt-3 border-t border-border/30">
          <span>Total</span>
          <span className="font-mono text-xl text-amber-500">${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Action Button */}
      <Link
        href="/checkout"
        onClick={onCheckoutClick}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99]"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="h-4 w-4" />
      </Link>

      {!isCompact && (
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Encrypted 256-bit SSL Checkout</span>
        </div>
      )}
    </div>
  );
}

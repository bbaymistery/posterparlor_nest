"use client";

import Image from "next/image";
import { ShieldCheck, Truck, Lock } from "lucide-react";
import { useAppSelector } from "@/store";
import { selectCartItems, selectCartSubtotal } from "@/store/slices/cart.slice";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE } from "@/features/cart/components/cart-summary";

export function CheckoutSummary() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : FLAT_SHIPPING_FEE;
  const taxAmount = Number((subtotal * 0.08).toFixed(2)); // 8% estimated sales tax
  const grandTotal = subtotal + shippingFee + taxAmount;

  return (
    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-card border border-border/40 shadow-xl">
      <h3 className="font-bold text-lg text-foreground border-b border-border/40 pb-4">
        Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
      </h3>

      {/* Item Thumbnails List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.posterId}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/30"
          >
            <div className="relative aspect-[2/3] w-12 rounded-lg overflow-hidden bg-secondary border border-border/40 flex-shrink-0">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs text-foreground truncate">{item.title}</h4>
              <p className="text-[11px] text-muted-foreground font-mono">
                Qty: {item.quantity} × ${item.price.toFixed(2)}
              </p>
            </div>
            <div className="font-mono font-bold text-xs text-amber-500 text-right">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-2.5 pt-4 border-t border-border/40 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-mono font-semibold text-foreground">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className="font-mono font-semibold">
            {isFreeShipping ? (
              <span className="text-emerald-400 font-bold uppercase">FREE</span>
            ) : (
              `$${shippingFee.toFixed(2)}`
            )}
          </span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>Estimated Sales Tax (8%)</span>
          <span className="font-mono font-semibold text-foreground">${taxAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm font-black text-foreground pt-3 border-t border-border/40">
          <span>Total Amount</span>
          <span className="font-mono text-xl text-amber-500">${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Security Info */}
      <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/40 space-y-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Lock className="h-3.5 w-3.5 text-amber-500" />
          <span>Stripe Encrypted Payment</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-amber-500" />
          <span>Insured Expedited Delivery (3-5 Days)</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>100% Satisfaction Guarantee</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAppSelector } from "@/store";
import { selectCartItems } from "@/store/slices/cart.slice";
import { StripeWrapper } from "@/features/checkout/components/stripe-wrapper";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { CheckoutSummary } from "@/features/checkout/components/checkout-summary";

export default function CheckoutPage() {
  const items = useAppSelector(selectCartItems);

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20 px-4 text-center max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-foreground">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">
          You don't have any items in your cart to checkout. Add some posters first!
        </p>
        <Link
          href="/posters"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
        >
          Browse Posters
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-amber-500 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Cart</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Checkout
          </h1>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
          <ShieldCheck className="h-4 w-4" />
          <span>Encrypted Checkout</span>
        </div>
      </div>

      {/* Main Form & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <StripeWrapper>
            <CheckoutForm />
          </StripeWrapper>
        </div>

        <div className="lg:col-span-5 sticky top-24">
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
}

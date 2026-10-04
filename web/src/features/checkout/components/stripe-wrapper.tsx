"use client";

import { useMemo } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useGetPaymentKeyQuery } from "@/store/api/order.api";
import { Loader2 } from "lucide-react";

interface StripeWrapperProps {
  children: React.ReactNode;
}

export function StripeWrapper({ children }: StripeWrapperProps) {
  const { data, isLoading, isError } = useGetPaymentKeyQuery();

  // Stripe publishable key (from NestJS API backend endpoint GET /api/order/payment/key or fallback test key)
  const publishableKey =
    data?.data?.publishableKey ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51UJX994kWAAlRLQzWEu7CLyaR316B7JnEgK3CK2CQXFAn7CftweTXPOEu6kdOlroq7YTyGeOvJ1axymRyQ0rtouP00uhbnFo66";

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2 font-medium text-sm">
        <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
        <span>Initializing Secure Payment Gateway...</span>
      </div>
    );
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
}

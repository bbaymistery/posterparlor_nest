"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, PackageCheck, ShoppingBag, Loader2, Truck } from "lucide-react";
import { useGetOrderByIdQuery } from "@/store/api/order.api";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const { data, isLoading } = useGetOrderByIdQuery(orderId || "", {
    skip: !orderId,
  });

  const order = data?.data;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-4">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xl mb-2">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Order Confirmed! 🎉
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Thank you for your purchase! We have received your order and are preparing your fine art prints for shipment.
        </p>
      </div>

      {/* Order Info Card */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          <span>Fetching order confirmation...</span>
        </div>
      ) : order ? (
        <div className="p-6 rounded-3xl bg-card border border-border/40 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase block">
                Order ID
              </span>
              <span className="font-mono font-bold text-sm text-amber-500">
                #{order._id}
              </span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground font-semibold uppercase block text-right">
                Payment Status
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.isPaid
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {order.isPaid ? "Paid (Stripe)" : "Pending (COD)"}
              </span>
            </div>
          </div>

          {/* Shipping Address & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/30 space-y-1">
              <span className="font-semibold text-muted-foreground uppercase text-[10px] block">
                Delivery Address
              </span>
              <p className="font-bold text-foreground">{order.customer?.name || "Customer"}</p>
              <p className="text-muted-foreground">{order.shippingAddress.addressLine1}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/30 space-y-1">
              <span className="font-semibold text-muted-foreground uppercase text-[10px] block flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-amber-500" /> Estimated Delivery
              </span>
              <p className="font-bold text-foreground">3 - 5 Business Days</p>
              <p className="text-muted-foreground">Standard Insured Courier Shipping</p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Order Items ({order.items.length})
            </h4>

            <div className="space-y-2">
              {order.items.map((item, idx) => {
                const posterTitle =
                  typeof item.posterId === "object" ? item.posterId.title : "Art Print";

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30 text-xs"
                  >
                    <span className="font-semibold text-foreground">{posterTitle}</span>
                    <span className="font-mono text-muted-foreground">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Price */}
          <div className="flex justify-between items-center pt-4 border-t border-border/40 font-bold">
            <span className="text-sm text-foreground">Total Paid</span>
            <span className="font-mono text-xl text-amber-500">
              ${order.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/myorders"
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
        >
          <PackageCheck className="h-4 w-4" />
          <span>View My Orders</span>
        </Link>

        <Link
          href="/posters"
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-secondary text-foreground font-bold text-sm border border-border/40 hover:bg-secondary/80 transition-all"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            <span>Loading confirmation...</span>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}

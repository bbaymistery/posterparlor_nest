"use client";

import Link from "next/link";
import { Package, Clock, ShoppingBag, ArrowLeft, Loader2, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { useGetMyOrdersQuery, OrderStatus } from "@/store/api/order.api";
import { useAppSelector } from "@/store";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  PENDING: { label: "Pending", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
  PROCESSING: { label: "Processing", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-rose-500/10 text-rose-400 border-rose-500/20", icon: AlertCircle },
};

export default function MyOrdersPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading, isError } = useGetMyOrdersQuery();

  const orders = data?.data?.orders || [];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-border/40 pb-6 space-y-2">
        <Link
          href="/posters"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-amber-500 transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
          <span>My Order History</span>
          {orders.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          )}
        </h1>
        <p className="text-xs text-muted-foreground">
          Track your past purchases, shipment statuses, and payment receipts.
        </p>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium text-muted-foreground">Loading your order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center rounded-3xl bg-card/40 border border-border/40 space-y-6 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-secondary border border-border/40 flex items-center justify-center text-muted-foreground">
            <Package className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">No orders found</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              You haven't placed any orders yet. Discover our premium art prints and place your first order!
            </p>
          </div>
          <Link
            href="/posters"
            className="inline-flex items-center gap-2 py-3.5 px-8 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Browse Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusConfig.icon;
            const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={order._id}
                className="p-6 rounded-3xl bg-card border border-border/40 hover:border-border transition-all space-y-4 shadow-sm"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 pb-4">
                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold block">
                      Order #{order._id}
                    </span>
                    <span className="text-xs font-medium text-foreground block">
                      Placed on {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusConfig.color}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span>{statusConfig.label}</span>
                    </span>

                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase font-mono ${
                        order.isPaid
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {order.isPaid ? "PAID" : "COD"}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-2 text-xs">
                  {order.items.map((item, idx) => {
                    const posterTitle =
                      typeof item.posterId === "object" ? item.posterId.title : "Art Print";

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/20"
                      >
                        <span className="font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                          {posterTitle}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Order Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-border/30">
                  <div className="text-muted-foreground font-medium">
                    Shipping to: <strong className="text-foreground">{order.shippingAddress.city}, {order.shippingAddress.state}</strong>
                  </div>

                  <div className="font-bold text-sm text-foreground">
                    Total: <span className="font-mono text-amber-500">${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

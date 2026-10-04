"use client";

import React, { useState, useEffect } from "react";
import { OrderResponse, OrderStatus } from "@/types";
import { useUpdateOrderStatusMutation, useCancelOrderMutation } from "@/store/api/admin.api";
import { toast } from "sonner";
import { X, Truck, AlertCircle, CheckCircle2, Loader2, PackageCheck } from "lucide-react";

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponse | null;
}

const ORDER_STATUSES: { label: string; value: OrderStatus; color: string }[] = [
  { label: "Pending", value: "PENDING", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
  { label: "Processing", value: "PROCESSING", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  { label: "Shipped", value: "SHIPPED", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  { label: "Delivered", value: "DELIVERED", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  { label: "Cancelled", value: "CANCELLED", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
];

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("PROCESSING");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setTrackingNumber(order.trackingNumber || "");
      setCancelReason("");
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedStatus === "CANCELLED") {
        await cancelOrder({ orderId: order._id, reason: cancelReason }).unwrap();
        toast.success("Order cancelled successfully.");
      } else {
        await updateStatus({
          orderId: order._id,
          status: selectedStatus,
          trackingNumber: trackingNumber || undefined,
        }).unwrap();
        toast.success(`Order status updated to ${selectedStatus}!`);
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update order status.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border/50 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Update Order Status</h2>
              <p className="text-xs text-muted-foreground font-mono">
                Order ID: #{order._id.slice(-8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fulfillment Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ORDER_STATUSES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setSelectedStatus(st.value)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    selectedStatus === st.value
                      ? `${st.color} shadow-lg ring-2 ring-amber-500/50`
                      : "bg-secondary/30 border-border/40 text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tracking Number Input for Shipped / Delivered */}
          {(selectedStatus === "SHIPPED" || selectedStatus === "DELIVERED") && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tracking Number (Optional)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. TRK-894120948"
                className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 text-sm transition-all"
              />
            </div>
          )}

          {/* Cancellation Reason */}
          {selectedStatus === "CANCELLED" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Reason for Cancellation
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Item out of stock, customer request, etc."
                className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-rose-500 text-sm transition-all resize-none"
              />
            </div>
          )}

          {/* Customer & Shipping Summary */}
          <div className="p-4 rounded-2xl bg-secondary/20 border border-border/30 text-xs space-y-1 text-muted-foreground">
            <p className="font-semibold text-foreground">
              Customer: {order.customer?.name || "Guest Customer"} ({order.customer?.phone})
            </p>
            <p>
              Address: {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.state} ({order.shippingAddress.pincode})
            </p>
            <p className="font-semibold text-amber-400">Total Price: ${order.totalPrice.toFixed(2)}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || isCancelling}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUpdating || isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <PackageCheck className="h-4 w-4" />
                  <span>Confirm Status</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

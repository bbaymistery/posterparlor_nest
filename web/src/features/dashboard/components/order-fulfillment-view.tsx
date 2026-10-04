"use client";

import React, { useState } from "react";
import { OrderResponse, OrderStatus } from "@/types";
import { useGetAdminOrdersQuery, useDeleteOrderMutation } from "@/store/api/admin.api";
import { OrderStatusModal } from "./order-status-modal";
import { toast } from "sonner";
import {
  ShoppingBag,
  Search,
  Truck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

export const OrderFulfillmentView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useGetAdminOrdersQuery({
    page,
    limit: 8,
    status: selectedStatus,
    search: searchTerm || undefined,
  });

  const [deleteOrder] = useDeleteOrderMutation();

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination;

  const handleOpenStatusModal = (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(orderId).unwrap();
        toast.success("Order deleted successfully.");
      } catch (err: any) {
        toast.error("Failed to delete order.");
      }
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "PROCESSING":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "SHIPPED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Order Fulfillment Center</h2>
            <p className="text-xs text-muted-foreground">
              Review customer orders, update tracking numbers, and manage fulfillment workflow
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search order ID, customer name, phone, state..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 text-sm transition-all shadow-md"
          />
        </div>

        <select
          value={selectedStatus || ""}
          onChange={(e) => {
            setSelectedStatus((e.target.value as OrderStatus) || undefined);
            setPage(1);
          }}
          className="px-4 py-3 rounded-2xl bg-card border border-border/40 text-foreground text-sm focus:outline-none focus:border-amber-500 transition-all shadow-md"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-card border border-border/40 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-3">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-semibold">No orders found matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID & Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment Mode</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-secondary/20 transition-colors">
                    {/* ID & Date */}
                    <td className="px-6 py-4">
                      <p className="font-mono font-bold text-foreground text-xs">
                        #{order._id.slice(-8)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground text-xs">
                        {order.customer?.name || "Guest Customer"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {order.customer?.phone} • {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                    </td>

                    {/* Items */}
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {order.items?.length || 0} items
                    </td>

                    {/* Total Amount */}
                    <td className="px-6 py-4 font-extrabold text-amber-400">
                      ${order.totalPrice.toFixed(2)}
                    </td>

                    {/* Payment Details */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${order.paymentDetails?.method === "STRIPE"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                      >
                        {order.paymentDetails?.method === "COD"
                          ? "CASH • UNPAID"
                          : `${order.paymentDetails?.method || "STRIPE"} • ${order.isPaid ? "PAID" : "UNPAID"}`}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenStatusModal(order)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs border border-amber-500/20 transition-all cursor-pointer"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          <span>Update</span>
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="p-1.5 rounded-xl bg-secondary hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-all cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && (pagination as any).totalPages > 1 && (
          <div className="p-4 border-t border-border/40 bg-secondary/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing page {(pagination as any).currentPage} of {(pagination as any).totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={!(pagination as any).hasPrevPage}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={!(pagination as any).hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-40 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Order Status */}
      <OrderStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

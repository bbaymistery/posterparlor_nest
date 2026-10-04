"use client";

import React from "react";
import {
  useGetDashboardStatsQuery,
  useGetRecentOrdersQuery,
  useGetTopProductsQuery,
} from "@/store/api/admin.api";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  Sparkles,
} from "lucide-react";

export const DashboardOverviewStats: React.FC = () => {
  const { data: statsData, isLoading: isLoadingStats } = useGetDashboardStatsQuery();
  const { data: recentOrdersData, isLoading: isLoadingRecent } = useGetRecentOrdersQuery(5);
  const { data: topProductsData, isLoading: isLoadingTop } = useGetTopProductsQuery(5);

  const stats = statsData?.data;
  const recentOrders = recentOrdersData?.data || [];
  const topProducts = topProductsData?.data || [];

  if (isLoadingStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading dashboard analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00",
      change: stats?.revenueChange || 14.2,
      icon: DollarSign,
      color: "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      change: stats?.ordersChange || 8.7,
      icon: ShoppingBag,
      color: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      change: stats?.customersChange || 12.5,
      icon: Users,
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    },
    {
      title: "Active Products",
      value: stats?.totalProducts || 0,
      change: 4.1,
      icon: Package,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
  ];

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "PROCESSING":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "SHIPPED":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "DELIVERED":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "CANCELLED":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    }
  };

  const statusBadges = [
    { label: "Pending", count: stats?.pendingOrders || 0, icon: Clock, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    { label: "Processing", count: stats?.processingOrders || 0, icon: RotateCcw, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { label: "Shipped", count: stats?.shippedOrders || 0, icon: Truck, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { label: "Delivered", count: stats?.deliveredOrders || 0, icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { label: "Cancelled", count: stats?.cancelledOrders || 0, icon: XCircle, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  ];

  return (
    <div className="space-y-8">
      {/* 4 Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl bg-gradient-to-br ${card.color} border shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  {card.title}
                </span>
                <div className="p-2.5 rounded-2xl bg-background/40 backdrop-blur-md">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {card.value}
                </span>
                <span className="inline-flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{card.change}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fulfillment Status Breakdown Bar */}
      <div className="p-6 rounded-3xl bg-card border border-border/40 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Fulfillment Pipeline</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statusBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border ${badge.color} flex items-center justify-between`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{badge.label}</span>
                </div>
                <span className="text-base font-extrabold">{badge.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="p-6 rounded-3xl bg-card border border-border/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-amber-500" />
              <span>Recent Orders</span>
            </h3>
            <span className="text-xs text-muted-foreground">Latest 5 sales</span>
          </div>

          {isLoadingRecent ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading recent orders...</div>
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No recent orders yet.</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-3.5 rounded-2xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">
                      {order.customer?.name || "Guest Customer"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      #{order._id.slice(-8)} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-xs font-extrabold text-amber-400">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                    <div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadgeStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="p-6 rounded-3xl bg-card border border-border/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <span>Top Products</span>
            </h3>
            <span className="text-xs text-muted-foreground">Best sellers</span>
          </div>

          {isLoadingTop ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading top products...</div>
          ) : topProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No sales data available.</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((prod) => (
                <div
                  key={prod._id}
                  className="p-3.5 rounded-2xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-secondary border border-border/40 flex-shrink-0">
                      {prod.images?.[0]?.url ? (
                        <img src={prod.images[0].url} alt={prod.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground m-auto" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground line-clamp-1">{prod.title}</p>
                      <p className="text-[10px] text-muted-foreground">{prod.category} • ${prod.price}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-400 block">
                      ${prod.totalRevenue ? prod.totalRevenue.toFixed(2) : (prod.price * (prod.totalSold || 1)).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {prod.totalSold || 0} sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

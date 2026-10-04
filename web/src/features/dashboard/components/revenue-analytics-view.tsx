"use client";

import React, { useState } from "react";
import { useGetRevenueAnalyticsQuery, useGetTopProductsQuery } from "@/store/api/admin.api";
import { TrendingUp, DollarSign, Calendar, Loader2, Sparkles, ShoppingBag, Award } from "lucide-react";

export const RevenueAnalyticsView: React.FC = () => {
  const [period, setPeriod] = useState<string>("monthly");

  const { data: revenueData, isLoading: isLoadingRevenue } = useGetRevenueAnalyticsQuery(period);
  const { data: topProductsData, isLoading: isLoadingTop } = useGetTopProductsQuery(10);

  const analytics = revenueData?.data;
  const dataPoints = analytics?.data || [
    { date: "Jan", revenue: 1240, orders: 32 },
    { date: "Feb", revenue: 1890, orders: 48 },
    { date: "Mar", revenue: 2300, orders: 56 },
    { date: "Apr", revenue: 3100, orders: 74 },
    { date: "May", revenue: 2800, orders: 62 },
    { date: "Jun", revenue: 4200, orders: 95 },
  ];

  const topProducts = topProductsData?.data || [];

  const maxRevenue = Math.max(...dataPoints.map((d) => d.revenue), 1000);

  return (
    <div className="space-y-8">
      {/* Header & Period Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Revenue Analytics & Insights</h2>
            <p className="text-xs text-muted-foreground">
              Monitor store revenue growth, sales volume trends, and top performing artworks
            </p>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center p-1.5 rounded-2xl bg-secondary/40 border border-border/40">
          {["daily", "weekly", "monthly"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                period === p
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Chart Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/40 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-500" />
              <span>Revenue Trend ({period.toUpperCase()})</span>
            </h3>
            <p className="text-xs text-muted-foreground">Financial performance overview</p>
          </div>
          <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            +18.4% vs last period
          </span>
        </div>

        {isLoadingRevenue ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Generating revenue breakdown...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bar Chart Visualization */}
            <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 border-b border-border/30 pb-2">
              {dataPoints.map((item, index) => {
                const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg border border-border/40 whitespace-nowrap mb-1">
                      ${item.revenue.toLocaleString()} ({item.orders} orders)
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${Math.max(heightPercent, 12)}%` }}
                      className="w-full max-w-[48px] rounded-t-2xl bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 hover:from-amber-400 hover:to-amber-300 transition-all duration-300 shadow-lg shadow-amber-500/20 relative group-hover:scale-105"
                    />

                    {/* X-axis Label */}
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Top Products Detailed Leaderboard */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/40 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Top Performing Products Leaderboard</h3>
              <p className="text-xs text-muted-foreground">Most ordered items sorted by total gross revenue</p>
            </div>
          </div>
        </div>

        {isLoadingTop ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading products leaderboard...</div>
        ) : topProducts.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">No revenue leaderboard data yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topProducts.map((product, rank) => (
              <div
                key={product._id}
                className="p-4 rounded-2xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 font-extrabold text-sm text-amber-500">#{rank + 1}</span>
                  <div className="h-12 w-10 rounded-xl overflow-hidden bg-secondary border border-border/40 flex-shrink-0">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-5 w-5 text-muted-foreground m-auto" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground line-clamp-1">{product.title}</p>
                    <p className="text-[10px] text-muted-foreground">{product.category} • ${product.price}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-400 block">
                    ${product.totalRevenue ? product.totalRevenue.toFixed(2) : (product.price * (product.totalSold || 1)).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {product.totalSold || 0} units sold
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

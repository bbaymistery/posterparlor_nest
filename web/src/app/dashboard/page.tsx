"use client";

import React, { useState } from "react";
import { DashboardOverviewStats } from "@/features/dashboard/components/dashboard-overview-stats";
import { InventoryManagementView } from "@/features/dashboard/components/inventory-management-view";
import { OrderFulfillmentView } from "@/features/dashboard/components/order-fulfillment-view";
import { RevenueAnalyticsView } from "@/features/dashboard/components/revenue-analytics-view";
import { CustomersListView } from "@/features/dashboard/components/customers-list-view";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

type DashboardTab = "overview" | "inventory" | "orders" | "revenue" | "customers";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [visitedTabs, setVisitedTabs] = useState<Record<DashboardTab, boolean>>({
    overview: true,
    inventory: false,
    orders: false,
    revenue: false,
    customers: false,
  });

  const handleTabChange = (tabId: DashboardTab) => {
    setActiveTab(tabId);
    if (!visitedTabs[tabId]) {
      setVisitedTabs((prev) => ({ ...prev, [tabId]: true }));
    }
  };

  const tabs: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory & Catalog", icon: Package },
    { id: "orders", label: "Order Fulfillment", icon: ShoppingBag },
    { id: "revenue", label: "Revenue Analytics", icon: TrendingUp },
    { id: "customers", label: "Customers", icon: Users },
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Dashboard Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <ShieldAlert className="h-4 w-4" />
            <span>Admin Management Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <span>Control Center</span>
            <Sparkles className="h-6 w-6 text-amber-500" />
          </h1>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-secondary/40 border border-border/40 overflow-x-auto max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display - Lazy Mounting + Persistent Preservation */}
      <div>
        {visitedTabs.overview && (
          <div className={activeTab === "overview" ? "block animate-in fade-in duration-200" : "hidden"}>
            <DashboardOverviewStats />
          </div>
        )}
        {visitedTabs.inventory && (
          <div className={activeTab === "inventory" ? "block animate-in fade-in duration-200" : "hidden"}>
            <InventoryManagementView />
          </div>
        )}
        {visitedTabs.orders && (
          <div className={activeTab === "orders" ? "block animate-in fade-in duration-200" : "hidden"}>
            <OrderFulfillmentView />
          </div>
        )}
        {visitedTabs.revenue && (
          <div className={activeTab === "revenue" ? "block animate-in fade-in duration-200" : "hidden"}>
            <RevenueAnalyticsView />
          </div>
        )}
        {visitedTabs.customers && (
          <div className={activeTab === "customers" ? "block animate-in fade-in duration-200" : "hidden"}>
            <CustomersListView />
          </div>
        )}
      </div>
    </div>
  );
}

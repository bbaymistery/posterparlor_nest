"use client";

import React, { useState } from "react";
import { useGetCustomersQuery } from "@/store/api/admin.api";
import { Users, Search, ChevronLeft, ChevronRight, Loader2, ShieldCheck, Mail, Calendar, DollarSign, ShoppingBag } from "lucide-react";

export const CustomersListView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useGetCustomersQuery({
    page,
    limit: 10,
    search: searchTerm || undefined,
  });

  const customers = data?.data?.customers || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Customer Base Management</h2>
            <p className="text-xs text-muted-foreground">
              View registered users, purchase history metrics, roles, and account statuses
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          placeholder="Search customer name, email address, or user ID..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500 text-sm transition-all shadow-md"
        />
      </div>

      {/* Customers Table */}
      <div className="rounded-3xl bg-card border border-border/40 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Loading customers directory...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-semibold">No registered customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Orders Placed</th>
                  <th className="px-6 py-4">Total Spent</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-secondary/20 transition-colors">
                    {/* Customer Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm uppercase flex-shrink-0">
                          {cust.name ? cust.name.charAt(0) : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-xs">{cust.name || "Customer User"}</p>
                          <p className="text-[10px] text-muted-foreground">{cust.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          cust.role === "admin"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {cust.role === "admin" && <ShieldCheck className="h-3 w-3" />}
                        {cust.role?.toUpperCase() || "CUSTOMER"}
                      </span>
                    </td>

                    {/* Orders Placed */}
                    <td className="px-6 py-4 text-xs font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{cust.orderCount || 0} orders</span>
                      </div>
                    </td>

                    {/* Total Spent */}
                    <td className="px-6 py-4 font-extrabold text-emerald-400 text-xs">
                      ${cust.totalSpent ? cust.totalSpent.toFixed(2) : "0.00"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          cust.isActive !== false
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {cust.isActive !== false ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(cust.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border/40 bg-secondary/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCustomers} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-40 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

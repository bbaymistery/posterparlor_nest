import { OrderResponse, OrderStatus, PaginationInfo } from "./order.types";

/**
 * 📊 ADMIN DASHBOARD & MANAGEMENT TYPES
 */

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
}

export interface Customer {
  _id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  googleId: string;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface PaginatedCustomersResponse {
  customers: Customer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCustomers: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TopProduct {
  _id: string;
  title: string;
  images: { url: string; public_id: string }[];
  price: number;
  stock: number;
  category: string;
  totalSold: number;
  totalRevenue: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface RevenueAnalytics {
  period: string;
  data: RevenueDataPoint[];
}

export interface AdminPaginatedOrdersResponse {
  orders: OrderResponse[];
  pagination: PaginationInfo;
}

export interface GetAdminOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UpdateOrderStatusDto {
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string;
}

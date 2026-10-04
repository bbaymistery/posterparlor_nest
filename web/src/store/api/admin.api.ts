import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./base.query";
import { buildApiUrl } from "@/lib/helper";
import {
  DashboardStats,
  Customer,
  PaginatedCustomersResponse,
  TopProduct,
  RevenueDataPoint,
  RevenueAnalytics,
  AdminPaginatedOrdersResponse,
  GetAdminOrdersParams,
  GetCustomersParams,
  UpdateOrderStatusDto,
  OrderResponse,
  OrderStatus,
  PaginationInfo,
} from "@/types";

export type {
  DashboardStats,
  Customer,
  PaginatedCustomersResponse,
  TopProduct,
  RevenueDataPoint,
  RevenueAnalytics,
  AdminPaginatedOrdersResponse,
  GetAdminOrdersParams,
  GetCustomersParams,
  UpdateOrderStatusDto,
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminStats", "AdminOrders", "AdminCustomers", "AdminProducts"],
  endpoints: (builder) => ({
    // -------------------------------------------------------------
    // 🔗 Backend: GET /api/admin/stats (AdminController -> getStats)
    // Admin paneli statistikalarını (gəlir, sifariş sayları və cəmi müştərilər) gətirir
    // -------------------------------------------------------------
    getDashboardStats: builder.query<{ data: DashboardStats }, void>({
      query: () => "/admin/stats",
      providesTags: ["AdminStats"],
    }),
    // -------------------------------------------------------------
    // 🔗 Backend: GET /api/admin/orders/recent (AdminController -> getRecentOrders)
    // Son daxil olan sifarişləri gətirir
    // -------------------------------------------------------------
    getRecentOrders: builder.query<{ data: OrderResponse[] }, number | undefined>({
      query: (limit) => buildApiUrl("/admin/orders/recent", { limit }),
      providesTags: ["AdminOrders"],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: GET /api/admin/orders (AdminController -> getAdminOrders)
    // Bütün sifarişləri filter və pagination ilə gətirir
    // -------------------------------------------------------------
    getAdminOrders: builder.query<{ data: AdminPaginatedOrdersResponse }, GetAdminOrdersParams | void>({
      query: (params) =>
        buildApiUrl("/admin/orders", {
          page: params?.page,
          limit: params?.limit,
          status: params?.status,
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        }),
      providesTags: ["AdminOrders"],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: GET /api/admin/orders/:id (AdminController -> getAdminOrderById)
    // ID-yə görə tək sifariş haqqında detallı admin məlumatı gətirir
    // -------------------------------------------------------------
    getAdminOrderById: builder.query<{ data: OrderResponse }, string>({
      query: (orderId) => `/admin/orders/${orderId}`,
      providesTags: (result, error, id) => [{ type: "AdminOrders", id }],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: PATCH /api/admin/orders/:id/status (AdminController -> updateOrderStatus)
    // Sifarişin statusunu yeniləyir (PENDING -> PROCESSING -> SHIPPED -> DELIVERED)
    // -------------------------------------------------------------
    updateOrderStatus: builder.mutation<{ data: OrderResponse }, UpdateOrderStatusDto>({
      query: ({ orderId, status, trackingNumber }) => ({
        url: `/admin/orders/${orderId}/status`,
        method: "PATCH",
        body: { status, trackingNumber },
      }),
      invalidatesTags: ["AdminOrders", "AdminStats"],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: PATCH /api/admin/orders/:id/cancel (AdminController -> cancelOrder)
    // Sifarişi ləğv edir
    // -------------------------------------------------------------
    cancelOrder: builder.mutation<{ data: OrderResponse }, { orderId: string; reason?: string }>({
      query: ({ orderId, reason }) => ({
        url: `/admin/orders/${orderId}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["AdminOrders", "AdminStats"],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: DELETE /api/admin/orders/:id (AdminController -> deleteOrder)
    // Sifarişi silir
    // -------------------------------------------------------------
    deleteOrder: builder.mutation<void, string>({
      query: (orderId) => ({
        url: `/admin/orders/${orderId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminOrders", "AdminStats"],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: GET /api/admin/customers (AdminController -> getCustomers)
    // Qeydiyyatdan keçmiş bütün müştərilərin siyahısını gətirir
    // -------------------------------------------------------------
    getCustomers: builder.query<{ data: PaginatedCustomersResponse }, GetCustomersParams | void>({
      query: (params) =>
        buildApiUrl("/admin/customers", {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
        }),
      providesTags: ["AdminCustomers"],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: GET /api/admin/products/top (AdminController -> getTopProducts)
    // Ən çox satılan məhsulların statistikası
    // -------------------------------------------------------------
    getTopProducts: builder.query<{ data: TopProduct[] }, number | undefined>({
      query: (limit) => buildApiUrl("/admin/products/top", { limit }),
      providesTags: ["AdminProducts"],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: GET /api/admin/analytics/revenue (AdminController -> getRevenueAnalytics)
    // Müəyyən dövr üzrə (günlük, həftəlik, aylıq) gəlir analitikası
    // -------------------------------------------------------------
    getRevenueAnalytics: builder.query<{ data: RevenueAnalytics }, string | undefined>({
      query: (period) => `/admin/analytics/revenue${period ? `?period=${period}` : ""}`,
      providesTags: ["AdminStats"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetRecentOrdersQuery,
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useLazyGetAdminOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useDeleteOrderMutation,
  useGetCustomersQuery,
  useGetTopProductsQuery,
  useGetRevenueAnalyticsQuery,
} = adminApi;

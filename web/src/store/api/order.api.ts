import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./base.query";
import { buildApiUrl } from "@/lib/helper";

import {
  PosterImage,
  PopulatedPoster,
  OrderItemDto,
  ShippingAddressDto,
  PaymentDetailsDto,
  CustomerInfoDto,
  CreateOrderDto,
  OrderStatus,
  OrderResponse,
  PaginationInfo,
  PaginatedOrdersResponse,
  GetOrdersParams,
  InitiateStripePaymentDto,
  InitiateStripePaymentResponse,
  VerifyStripePaymentDto,
} from "@/types";

export type {
  PosterImage,
  PopulatedPoster,
  OrderItemDto,
  ShippingAddressDto,
  PaymentDetailsDto,
  CustomerInfoDto,
  CreateOrderDto,
  OrderStatus,
  OrderResponse,
  PaginationInfo,
  PaginatedOrdersResponse,
  GetOrdersParams,
  InitiateStripePaymentDto,
  InitiateStripePaymentResponse,
  VerifyStripePaymentDto,
};

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Order"],
  endpoints: (builder) => ({

    // -------------------------------------------------------------
    // 🔗 Backend: GET /api/order/payment/key (OrderController -> getPaymentKey)
    // Stripe Publishable Key-i götürür
    // -------------------------------------------------------------
    getPaymentKey: builder.query<{ data: { publishableKey: string } }, void>({
      query: () => "/order/payment/key",
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: POST /api/order/payment/initiate (OrderController -> initiatePayment)
    // Stripe PaymentIntent yaradır və clientSecret qaytarır
    // -------------------------------------------------------------
    initiatePayment: builder.mutation<{ data: InitiateStripePaymentResponse }, InitiateStripePaymentDto>({
      query: (paymentData) => ({ url: "/order/payment/initiate", method: "POST", body: paymentData, }),
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: POST /api/order/payment/verify (OrderController -> verifyPayment)
    // Stripe tərəfindən ödənişin statusunu (succeeded) yoxlayır və DB-də sifarişi yaradır
    // -------------------------------------------------------------
    verifyPayment: builder.mutation<{ data: OrderResponse }, VerifyStripePaymentDto>({
      query: (verifyData) => ({ url: "/order/payment/verify", method: "POST", body: verifyData, }),
      invalidatesTags: ["Order"],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: POST /api/order (OrderController -> createOrder)
    // Birbaşa COD (Cash on Delivery) və ya manual sifariş yaradır
    // -------------------------------------------------------------
    createOrder: builder.mutation<{ data: OrderResponse }, CreateOrderDto>({
      query: (orderData) => ({ url: "/order", method: "POST", body: orderData, }),
      invalidatesTags: ["Order"],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: GET /api/order (OrderController -> getMyOrders)
    // Giriş etmiş istifadəçinin bütün sifarişlərini gətirir
    // -------------------------------------------------------------
    getMyOrders: builder.query<{ data: PaginatedOrdersResponse }, GetOrdersParams | void>({
      query: (params) => buildApiUrl("/order", { page: params?.page, limit: params?.limit, }),
      providesTags: ["Order"],
    }),

    // -------------------------------------------------------------
    // 🔗 Backend: GET /api/order/:id (OrderController -> getOrderById)
    // ID-yə görə tək sifarişin təfərrüatlarını gətirir
    // -------------------------------------------------------------
    getOrderById: builder.query<{ data: OrderResponse }, string>({
      query: (orderId) => `/order/${orderId}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
  }),
});

export const {
  useGetPaymentKeyQuery,
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useLazyGetOrderByIdQuery,
} = orderApi;

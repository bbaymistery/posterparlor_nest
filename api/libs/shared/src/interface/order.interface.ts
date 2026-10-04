import { OrderDocument } from '@new-poster-parlor-api/models';

export interface CreatePaymentOrderDto {
  amount: number; // Amount in cents (USD * 100)
  currency?: string;
  receipt?: string;
  metadata?: Record<string, string>;
}

export interface StripePaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface VerifyPaymentDto {
  paymentIntentId: string;
  sandbox?: boolean;
}

export interface PaymentVerificationResult {
  isValid: boolean;
  paymentIntentId: string;
  status: string;
  amount: number;
  currency: string;
}

export interface PaginatedOrdersResponse {
  orders: OrderDocument[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

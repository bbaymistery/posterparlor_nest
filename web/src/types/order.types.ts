/**
 * 💳 ORDER & PAYMENT TYPES
 */

export interface PosterImage {
  _id?: string;
  url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
}

export interface PopulatedPoster {
  _id: string;
  title: string;
  images: PosterImage[];
  dimensions: string;
  material?: string;
  category: string;
}

export interface OrderItemDto {
  posterId: string | PopulatedPoster;
  quantity: number;
  price: number;
}

export interface ShippingAddressDto {
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PaymentDetailsDto {
  method: "STRIPE" | "COD";
  amount: number;
  currency: "INR" | "USD";
  paymentIntentId?: string;
}

export interface CustomerInfoDto {
  name: string;
  email?: string;
  phone: string;
  userId?: string;
}

export interface CreateOrderDto {
  customer?: CustomerInfoDto;
  userId?: string;
  items: { posterId: string; quantity: number; price: number }[];
  shippingAddress: ShippingAddressDto;
  paymentDetails: PaymentDetailsDto;
  status?: string;
  isPaid?: boolean;
  shippingCost?: number;
  taxAmount?: number;
  totalPrice?: number;
  notes?: string;
}

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderResponse {
  _id: string;
  customer: CustomerInfoDto | null;
  items: OrderItemDto[];
  shippingAddress: ShippingAddressDto;
  paymentDetails: PaymentDetailsDto;
  status: OrderStatus;
  isPaid: boolean;
  shippingCost: number;
  taxAmount: number;
  totalPrice: number;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedOrdersResponse {
  orders: OrderResponse[];
  pagination: PaginationInfo;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
}

export interface InitiateStripePaymentDto {
  items: { posterId: string; quantity: number; price: number }[];
  shippingAddress: ShippingAddressDto;
  shippingCost: number;
  taxAmount: number;
  totalPrice: number;
}

export interface InitiateStripePaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface VerifyStripePaymentDto {
  paymentIntentId: string;
  customer?: CustomerInfoDto;
  items: { posterId: string; quantity: number; price: number }[];
  shippingAddress: ShippingAddressDto;
  shippingCost: number;
  taxAmount: number;
  totalPrice: number;
  currency?: string;
  notes?: string;
  sandbox?: boolean;
}

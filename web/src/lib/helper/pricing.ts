/**
 * Pricing utilities for the frontend (USD / US States)
 * NOTE: These calculations must match the backend at:
 * api/libs/orders/src/lib/order.service.ts
 */

import { US_STATES, REMOTE_STATES, PRICING_THRESHOLDS, type USState } from "@/lib/constants/pricing";

// Re-export constants for backward compatibility
export { US_STATES, REMOTE_STATES, type USState };

// Destructure pricing thresholds for internal use
const { BASE_SHIPPING, FREE_SHIPPING_THRESHOLD, REMOTE_STATE_CHARGE, GST_RATE } = PRICING_THRESHOLDS;

/**
 * Calculate shipping cost based on subtotal and delivery state
 * @param subtotal - Cart subtotal amount
 * @param state - Delivery state name
 * @returns Shipping cost in USD
 */
export function calculateShipping(subtotal: number, state: string): number {
  // Free shipping if subtotal >= $50, otherwise $5 flat fee
  const baseShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING;

  // Add state-based shipping (higher for remote areas like Alaska & Hawaii)
  const isRemoteState = REMOTE_STATES.includes(state as (typeof REMOTE_STATES)[number]);
  const remoteCharge = isRemoteState ? REMOTE_STATE_CHARGE : 0;

  return baseShipping + remoteCharge;
}

/**
 * Calculate tax on subtotal
 * @param subtotal - Cart subtotal amount
 * @returns Tax amount in USD
 */
export function calculateTax(subtotal: number): number {
  // 8% Sales Tax
  return Math.round(subtotal * GST_RATE * 100) / 100;
}

/**
 * Calculate total order price
 * @param subtotal - Cart subtotal amount
 * @param state - Delivery state name
 * @returns Object with all pricing breakdown
 */
export function calculateOrderTotal(subtotal: number, state: string): {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalPrice: number;
  freeShippingEligible: boolean;
  isRemoteState: boolean;
} {
  const shippingCost = calculateShipping(subtotal, state);
  const taxAmount = calculateTax(subtotal);
  const totalPrice = subtotal + shippingCost + taxAmount;

  return {
    subtotal,
    shippingCost,
    taxAmount,
    totalPrice,
    freeShippingEligible: subtotal >= FREE_SHIPPING_THRESHOLD,
    isRemoteState: REMOTE_STATES.includes(state as (typeof REMOTE_STATES)[number]),
  };
}

/**
 * Get shipping message for UI
 * @param subtotal - Cart subtotal
 * @returns Message about shipping status
 */
export function getShippingMessage(subtotal: number): string {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return "🎉 You qualify for free shipping!";

  const amountNeeded = FREE_SHIPPING_THRESHOLD - subtotal;
  return `Add $${amountNeeded.toFixed(2)} more for free shipping`;
}

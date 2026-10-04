"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { CreditCard, Banknote, ShieldCheck, Loader2, User, Phone, MapPin, Building, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectCartItems, selectCartSubtotal, clearCart } from "@/store/slices/cart.slice";
import {
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
  useCreateOrderMutation,
} from "@/store/api/order.api";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE } from "@/features/cart/components/cart-summary";

const US_STATES = [
  "California", "New York", "Texas", "Florida", "Illinois", "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan", "Washington"
];

export function CheckoutForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const stripe = useStripe();
  const elements = useElements();

  const user = useAppSelector((state) => state.auth.user);
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);

  const [initiatePayment, { isLoading: isInitiating }] = useInitiatePaymentMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const [createOrder, { isLoading: isCreatingCOD }] = useCreateOrderMutation();

  // Form State (Clean defaults, user fills inputs)
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("California");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "COD">("STRIPE");
  const [cardError, setCardError] = useState<string | null>(null);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : FLAT_SHIPPING_FEE;
  const taxAmount = Number((subtotal * 0.08).toFixed(2));
  const grandTotal = subtotal + shippingFee + taxAmount;

  const isProcessing = isInitiating || isVerifying || isCreatingCOD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!name || !phone || !addressLine1 || !city || !pincode) {
      toast.error("Please fill in all required shipping fields.");
      return;
    }

    const shippingAddress = { addressLine1, city, state, pincode };
    const orderItems = items.map((i) => ({
      posterId: i.posterId,
      quantity: i.quantity,
      price: i.price,
    }));

    // -------------------------------------------------------------
    // 💵 OPTION A: CASH ON DELIVERY (COD)
    // -------------------------------------------------------------
    if (paymentMethod === "COD") {
      try {
        const response = await createOrder({
          customer: { name, email, phone },
          items: orderItems,
          shippingAddress,
          paymentDetails: {
            method: "COD",
            amount: grandTotal,
            currency: "USD",
          },
          shippingCost: shippingFee,
          taxAmount,
          totalPrice: grandTotal,
          status: "PENDING",
          isPaid: false,
        }).unwrap();

        dispatch(clearCart());
        toast.success("Order placed successfully with Cash on Delivery!");
        router.push(`/checkout/success?orderId=${response.data._id}`);
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to place COD order.");
      }
      return;
    }

    // -------------------------------------------------------------
    // 💳 OPTION B: STRIPE PAYMENT
    // -------------------------------------------------------------
    if (!stripe || !elements) {
      toast.error("Stripe is not yet loaded. Please try again in a moment.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Card element not found.");
      return;
    }

    try {
      // 1. Initiate payment on backend to create PaymentIntent
      const initResult = await initiatePayment({
        items: orderItems,
        shippingAddress,
        shippingCost: shippingFee,
        taxAmount,
        totalPrice: grandTotal,
      }).unwrap();

      const { clientSecret, paymentIntentId } = initResult.data;

      // 2. Confirm card payment via Stripe SDK
      const stripeResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name,
            email,
            phone,
            address: {
              line1: addressLine1,
              city,
              state,
              postal_code: pincode,
            },
          },
        },
      });

      if (stripeResult.error) {
        setCardError(stripeResult.error.message || "Payment failed.");
        toast.error(stripeResult.error.message || "Payment verification failed.");
        return;
      }

      if (stripeResult.paymentIntent?.status === "succeeded") {
        // 3. Verify payment with backend & create order in DB (Pass full DTO required by NestJS)
        const verifyResult = await verifyPayment({
          paymentIntentId,
          customer: { name, email, phone },
          items: orderItems,
          shippingAddress,
          shippingCost: shippingFee,
          taxAmount,
          totalPrice: grandTotal,
          currency: "USD",
          ...(process.env.NODE_ENV === "development" ? { sandbox: true } : {}),
        }).unwrap();

        dispatch(clearCart());
        toast.success("Payment successful! Your order has been placed.");
        router.push(`/checkout/success?orderId=${verifyResult.data._id}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Payment process encountered an error.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step 1: Shipping Address Form */}
      <div className="p-6 rounded-3xl bg-card border border-border/40 space-y-6">
        <h3 className="font-bold text-lg text-foreground flex items-center gap-2 border-b border-border/40 pb-4">
          <MapPin className="h-5 w-5 text-amber-500" />
          <span>Shipping & Contact Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground block flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground font-medium focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground block flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground font-medium focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-semibold text-muted-foreground block flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555-019-2834"
              className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground font-medium focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Street Address */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-semibold text-muted-foreground block flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5" /> Address Line 1 *
            </label>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Street name, apartment, suite number"
              className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground font-medium focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground block">City *</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Los Angeles"
              className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground font-medium focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* State & Pincode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground block">State *</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground font-medium focus:outline-none focus:border-amber-500 transition-colors"
              >
                {US_STATES.map((s) => (
                  <option key={s} value={s} className="bg-card text-foreground">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground block">Postal Code *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="90001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground font-medium focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Payment Method Selection */}
      <div className="p-6 rounded-3xl bg-card border border-border/40 space-y-6">
        <h3 className="font-bold text-lg text-foreground flex items-center justify-between border-b border-border/40 pb-4">
          <span className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-500" />
            <span>Payment Method</span>
          </span>
          <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            SSL 256-bit Secure
          </span>
        </h3>

        {/* Method Toggle Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod("STRIPE")}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${paymentMethod === "STRIPE"
                ? "bg-amber-500/10 border-amber-500 text-amber-400 font-bold"
                : "bg-secondary/40 border-border/40 text-muted-foreground hover:bg-secondary"
              }`}
          >
            <CreditCard className="h-6 w-6 mb-2" />
            <span className="text-xs">Stripe Card Payment</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("COD")}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${paymentMethod === "COD"
                ? "bg-amber-500/10 border-amber-500 text-amber-400 font-bold"
                : "bg-secondary/40 border-border/40 text-muted-foreground hover:bg-secondary"
              }`}
          >
            <Banknote className="h-6 w-6 mb-2" />
            <span className="text-xs">Cash on Delivery</span>
          </button>
        </div>

        {/* Stripe Card Element Input */}
        {paymentMethod === "STRIPE" && (
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/50 space-y-3">
            <label className="text-xs font-semibold text-muted-foreground block">
              Credit / Debit Card Details
            </label>
            <div className="p-3.5 rounded-xl bg-background border border-border/50 shadow-inner">
              <CardElement
                onChange={(e) => setCardError(e.error ? e.error.message : null)}
                options={{
                  hidePostalCode: true,
                  style: {
                    base: {
                      fontSize: "14px",
                      color: "#f8fafc",
                      fontFamily: "var(--font-mono), monospace",
                      "::placeholder": {
                        color: "#94a3b8",
                      },
                    },
                    invalid: {
                      color: "#f87171",
                    },
                  },
                }}
              />
            </div>

            {cardError && (
              <p className="text-xs text-rose-400 font-medium">{cardError}</p>
            )}

            <p className="text-[11px] text-muted-foreground">
              💡 Test card: Use <code className="text-amber-400">4242 4242 4242 4242</code> with any future expiry date and CVC.
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 py-4 px-8 rounded-2xl bg-amber-500 text-black font-extrabold text-base hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing Order & Payment...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-5 w-5" />
            <span>
              {paymentMethod === "STRIPE"
                ? `Pay $${grandTotal.toFixed(2)} with Stripe`
                : `Place Order ($${grandTotal.toFixed(2)} COD)`}
            </span>
          </>
        )}
      </button>
    </form>
  );
}

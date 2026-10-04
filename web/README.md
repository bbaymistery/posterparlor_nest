# 🚀 ArtisanFrame — Frontend Step-by-Step Development Roadmap

Welcome to the **Next.js 16 (App Router)** Frontend client for **ArtisanFrame**! This document defines the exact step-by-step development roadmap for building our full-stack application step by step.

---

## 📌 STEP-BY-STEP DEVELOPMENT ROADMAP

```
[ Step 1: Layout & API Docs ] ──► [ Step 2: Auth & Session ] ──► [ Step 3: Catalog & Details ]
                                                                        │
[ Step 6: Product Reviews ]   ◄── [ Step 5: Stripe Checkout ] ◄── [ Step 4: Cart System ]
            │
            ▼
[ Step 7: Admin Control Center ]
```

---

### 🟢 STEP 1: Core Layout & API Documentation (COMPLETED)
- [x] **Header Component**: Logo, Navigation Links, Cart Counter, and API Docs link.
- [x] **Footer Component**: Stack info, quick links, and copyright.
- [x] **API Documentation Page (`/api-docs`)**: Interactive reference in English for all 5 NestJS modules (`Auth`, `Inventory`, `Order`, `Review`, `Admin`).

---

### 🟢 STEP 2: Authentication & Session Management (COMPLETED)
- [x] **Google OAuth Button & Login Modal**: Integration with `@react-oauth/google` and fallback demo login.
- [x] **User Header Badge (`UserNav`)**: Shows user avatar, name, email, role (`USER` / `ADMIN`), and Sign Out action.
- [x] **Auth State Sync**: Connect with `auth.api.ts` (`loginWithGoogle`, `logout`, `getCurrentUser`), `auth.slice.ts`, and `AuthInitializer`.

---

### 🟢 STEP 3: Poster Catalog & Product Showcase (COMPLETED)
- [x] **Catalog Page (`/posters`)**: Grid of poster cards with images, titles, dimensions, and prices.
- [x] **Filtering & Search**: Category selector tabs, search input, price/date/title sorting, and pagination.
- [x] **Poster Detail Page (`/posters/:id`)**: Image gallery viewer, specifications, stock indicator, quantity selector, and Add to Cart.
- [x] **RTK Query Integration**: Connected with `inventory.api.ts` (`getAllInventory`, `getInventoryItemById`, `getFeaturedPosters`, `getAllFilters`).

---

### 🟢 STEP 4: Shopping Cart & Local Persistence (COMPLETED)
- [x] **Cart Drawer & Dedicated Page (`/cart`)**: Item list, quantity increment/decrement, clear cart, and item removal.
- [x] **Price Summary**: Subtotal, shipping cost calculator, and free shipping progress bar (`CartSummary`).
- [x] **State Persistence**: Connected with `cart.slice.ts` and `localStorage`.

---

### 🟢 STEP 5: Checkout & Stripe Payment Integration (COMPLETED)
- [x] **Checkout Form (`/checkout`)**: Shipping address inputs (US States dropdown), contact info, and payment mode toggle (`STRIPE` vs `COD`).
- [x] **Stripe Elements Integration**: Connected with `@stripe/stripe-js` & `@stripe/react-stripe-js` using backend API publishable key.
- [x] **Payment Workflow**:
  1. Call `POST /api/order/payment/initiate` to get `clientSecret` and `paymentIntentId`.
  2. Confirm payment via Stripe SDK.
  3. Call `POST /api/order/payment/verify` to confirm order creation in NestJS database.
- [x] **Order Confirmation (`/checkout/success`) & Order History (`/myorders`)**: List user's past purchases and real-time status.

---

### 🟢 STEP 6: Product Reviews & Ratings (COMPLETED)
- [x] **Review Section & Rating Breakdown**: Overall rating, total count, 1-5 star distribution bars, and rating filter tabs (`PosterReviewsSection`).
- [x] **Write & Edit Review Form (`ReviewFormModal`)**: Interactive 5-star selector, comment text, and Cloudinary multipart photo upload.
- [x] **Manage Own Reviews (`ReviewCard`)**: Edit and delete actions for user's own reviews or admin.

---

### 🟢 STEP 7: Admin Control Center (COMPLETED)
- [x] **Admin Dashboard (`/dashboard`)**: Overview stats (Revenue, Orders, Customers, Active Products, Fulfillment Pipeline).
- [x] **Inventory Management**: Create new poster (Cloudinary Multipart FormData upload), edit poster, soft delete (deactivate) & hard delete (`PosterFormModal`, `InventoryManagementView`).
- [x] **Order Fulfillment Table**: Update order status (`PENDING` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED`), tracking number input, cancellation reason (`OrderStatusModal`, `OrderFulfillmentView`).
- [x] **Revenue Analytics**: Interactive period selector (Daily, Weekly, Monthly), visual bar chart, and top performing products leaderboard (`RevenueAnalyticsView`).
- [x] **Customer Base Directory**: Registered user search, purchase history metrics, roles, and status badges (`CustomersListView`).

---

## 🛠️ How to Run the Project

1. **Start Backend (NestJS):**
   ```bash
   cd api
   npm run start
   ```

2. **Start Frontend (Next.js):**
   ```bash
   cd web
   npm run dev
   ```

import { ApiEndpoint, ApiModule } from "@/types";

export const API_MODULES: (ApiModule | "All")[] = [
  "All",
  "Auth",
  "Inventory",
  "Order",
  "Review",
  "Admin",
];

export const API_ENDPOINTS: ApiEndpoint[] = [
  // ================= Auth Module =================
  {
    id: "auth-login",
    module: "Auth",
    method: "POST",
    path: "/api/auth/google/login",
    title: "Google OAuth Login / Register",
    description: "Authenticates user using Google Credential idToken.",
    whyNeeded:
      "WHY IT IS NEEDED: Performs 1-click Google Login/Registration. Backend verifies Google token and sets 2 HttpOnly cookies (access_token & refresh_token) in browser.",
    authType: "Public",
    requestBody: {
      idToken: "string (Google Credential Token from Google SDK)",
    },
    responseExample: {
      success: true,
      message: "Authentication successful",
      data: {
        user: {
          id: "65d123...",
          name: "John Doe",
          email: "john@gmail.com",
          role: "USER",
        },
        accessToken: "eyJhbGciOi...",
      },
    },
  },
  {
    id: "auth-refresh",
    module: "Auth",
    method: "POST",
    path: "/api/auth/google/refresh",
    title: "Refresh JWT Access Token (Silent Re-Auth)",
    description:
      "Refreshes expired Access Token automatically in background using HttpOnly Refresh Cookie.",
    whyNeeded:
      "WHY REFRESH IS NEEDED: Access Token expires in 15 minutes for maximum security. When Access Token expires, backend returns HTTP 401. Frontend RTK Query (baseQueryWithReauth) catches 401, calls this endpoint silently using HttpOnly refresh_token cookie, gets a new Access Token cookie, and retries the failed request seamlessly without logging the user out!",
    authType: "Public",
    responseExample: {
      success: true,
      message: "Token refreshed successfully",
      data: { accessToken: "eyJhbGciOi..." },
    },
  },
  {
    id: "auth-logout",
    module: "Auth",
    method: "POST",
    path: "/api/auth/google/logout",
    title: "User Logout",
    description:
      "Clears HttpOnly authentication cookies from browser and invalidates user session.",
    whyNeeded:
      "WHY IT IS NEEDED: Clears both access_token and refresh_token cookies from the browser header, ending the authenticated session cleanly.",
    authType: "User",
    responseExample: {
      success: true,
      message: "Logged out successfully",
    },
  },
  {
    id: "auth-me",
    module: "Auth",
    method: "GET",
    path: "/api/auth/google/me",
    title: "Get Current Authenticated User Profile",
    description:
      "Fetches current logged-in user profile details (name, email, role).",
    whyNeeded:
      "WHY IT IS NEEDED: Used on application load (page refresh) to check if user has an active session and populate user state in Redux store.",
    authType: "User",
    responseExample: {
      success: true,
      data: {
        id: "65d123...",
        name: "John Doe",
        email: "john@gmail.com",
        role: "USER",
      },
    },
  },

  // ================= Inventory Module =================
  {
    id: "inv-list",
    module: "Inventory",
    method: "GET",
    path: "/api/inventory",
    title: "Get All Posters (With Filters & Pagination)",
    description:
      "Fetches poster items with filtering (category, price range, search query, tags) and pagination.",
    whyNeeded:
      "WHY IT IS NEEDED: Powers the Catalog page (/posters) and search bar. Allows filtering posters by category, price, keywords, and page index.",
    authType: "Public",
    queryParams: {
      page: "number (default: 1)",
      limit: "number (default: 10)",
      category: "string (e.g. Movies, Anime, Vintage)",
      search: "string (keyword search)",
      sortBy: "price | stock | createdAt | title",
      sortOrder: "asc | desc",
    },
    responseExample: {
      data: {
        posters: [
          { id: "1", title: "Cyberpunk Poster", price: 19.99, stock: 50 },
        ],
        pagination: { page: 1, limit: 10, total: 45, pages: 5 },
      },
    },
  },
  {
    id: "inv-featured",
    module: "Inventory",
    method: "GET",
    path: "/api/inventory/featured",
    title: "Get Featured Posters",
    description: "Fetches curated featured posters for home page showcase.",
    whyNeeded: "WHY IT IS NEEDED: Populates the Home page featured posters carousel.",
    authType: "Public",
  },
  {
    id: "inv-get-one",
    module: "Inventory",
    method: "GET",
    path: "/api/inventory/:id",
    title: "Get Poster Details By ID",
    description:
      "Fetches full poster details, dimensions, materials, and Cloudinary image URLs.",
    whyNeeded: "WHY IT IS NEEDED: Powers the Poster Detail Page (/posters/:id).",
    authType: "Public",
  },
  {
    id: "inv-categories",
    module: "Inventory",
    method: "GET",
    path: "/api/inventory/categories/list",
    title: "Get All Categories & Filter Counts",
    description:
      "Fetches list of available poster categories along with item counts.",
    whyNeeded:
      "WHY IT IS NEEDED: Populates category filter sidebar dropdowns in catalog.",
    authType: "Public",
  },
  {
    id: "inv-create",
    module: "Inventory",
    method: "POST",
    path: "/api/inventory",
    title: "Create New Poster Item (Admin Upload)",
    description:
      "Creates a new poster item with uploaded images (Multipart FormData). Admin authorization required.",
    whyNeeded:
      "WHY IT IS NEEDED: Admin panel product creation form. Backend uploads images to Cloudinary CDN automatically.",
    authType: "Admin",
    requestBody: {
      title: "Cyberpunk City",
      description: "Futuristic neon poster",
      category: "Sci-Fi",
      dimensions: "24x36 inches",
      price: 24.99,
      stock: 100,
      images: "File[] (Multipart FormData)",
    },
  },
  {
    id: "inv-update",
    module: "Inventory",
    method: "PUT",
    path: "/api/inventory/:id",
    title: "Update Poster Item",
    description:
      "Updates poster details and manages image gallery. Admin authorization required.",
    whyNeeded: "WHY IT IS NEEDED: Admin panel product editing form.",
    authType: "Admin",
  },
  {
    id: "inv-delete",
    module: "Inventory",
    method: "DELETE",
    path: "/api/inventory/:id",
    title: "Soft Delete Poster",
    description:
      "Deactivates poster item from public catalog (Soft Delete). Admin authorization required.",
    whyNeeded:
      "WHY IT IS NEEDED: Admin panel product deactivation without destroying purchase order records.",
    authType: "Admin",
  },

  // ================= Order & Stripe Module =================
  {
    id: "order-stripe-key",
    module: "Order",
    method: "GET",
    path: "/api/order/payment/key",
    title: "Get Stripe Publishable Key",
    description:
      "Retrieves Stripe Publishable Key used by frontend Stripe Elements widget.",
    whyNeeded:
      "WHY IT IS NEEDED: Step 1 of Checkout. Frontend initializes Stripe Elements SDK with this key.",
    authType: "User",
    responseExample: {
      data: { publishableKey: "pk_test_51..." },
    },
  },
  {
    id: "order-stripe-initiate",
    module: "Order",
    method: "POST",
    path: "/api/order/payment/initiate",
    title: "Initiate Stripe PaymentIntent",
    description:
      "Creates Stripe PaymentIntent and returns clientSecret for checkout widget.",
    whyNeeded:
      "WHY IT IS NEEDED: Step 2 of Checkout. Calculates subtotal, shipping cost, tax in USD, creates Stripe PaymentIntent, and returns clientSecret to mount credit card input.",
    authType: "User",
    requestBody: {
      items: [{ posterId: "65d123...", quantity: 2, price: 19.99 }],
      shippingAddress: {
        addressLine1: "123 Main St",
        city: "New York",
        state: "NY",
        pincode: "10001",
      },
      shippingCost: 5.0,
      taxAmount: 3.2,
      totalPrice: 48.18,
    },
    responseExample: {
      data: {
        clientSecret: "pi_3M..._secret_...",
        paymentIntentId: "pi_3M...",
        amount: 4818,
        currency: "usd",
      },
    },
  },
  {
    id: "order-stripe-verify",
    module: "Order",
    method: "POST",
    path: "/api/order/payment/verify",
    title: "Verify Stripe Payment & Create Order",
    description:
      "Verifies Stripe payment status (succeeded) and generates new Order document in MongoDB.",
    whyNeeded:
      "WHY IT IS NEEDED: Step 3 of Checkout. After credit card payment succeeds, frontend calls this endpoint to confirm payment status with Stripe API and save the order in database.",
    authType: "User",
    requestBody: {
      paymentIntentId: "pi_3M...",
      orderId: "string (optional)",
    },
  },
  {
    id: "order-get-mine",
    module: "Order",
    method: "GET",
    path: "/api/order",
    title: "Get Authenticated User Orders",
    description: "Fetches order history for current logged-in user.",
    whyNeeded: "WHY IT IS NEEDED: Powers the My Orders page (/myorder).",
    authType: "User",
  },
  {
    id: "order-get-one",
    module: "Order",
    method: "GET",
    path: "/api/order/:id",
    title: "Get Order Details By ID",
    description: "Fetches single order details and item breakdown.",
    whyNeeded:
      "WHY IT IS NEEDED: Shows order confirmation and shipping status tracking details.",
    authType: "User",
  },

  // ================= Review Module =================
  {
    id: "review-get-poster",
    module: "Review",
    method: "GET",
    path: "/api/review/:posterId",
    title: "Get Poster Reviews",
    description:
      "Fetches ratings, reviews, and uploaded photos for a specific poster.",
    whyNeeded:
      "WHY IT IS NEEDED: Displays customer reviews section on Poster Detail Page.",
    authType: "Public",
    queryParams: {
      page: "number (default: 1)",
      limit: "number (default: 10)",
      sort: "newest | oldest | highest | lowest",
      rating: "1..5 (filter by rating)",
      hasImage: "true (only with photos)",
    },
  },
  {
    id: "review-create",
    module: "Review",
    method: "POST",
    path: "/api/review/:posterId",
    title: "Create Product Review",
    description:
      "Submits a review rating (1-5 stars), text comment, and optional image attachments.",
    whyNeeded:
      "WHY IT IS NEEDED: Allows verified buyers to post star rating and review photos.",
    authType: "User",
    requestBody: {
      rating: 5,
      comment: "Amazing poster quality!",
      images: "File[] (Multipart FormData)",
    },
  },
  {
    id: "review-update",
    module: "Review",
    method: "PUT",
    path: "/api/review/:id",
    title: "Update Review",
    description: "Allows user to update their existing product review.",
    whyNeeded:
      "WHY IT IS NEEDED: Allows review author to edit their comment or rating.",
    authType: "User",
  },
  {
    id: "review-delete",
    module: "Review",
    method: "DELETE",
    path: "/api/review/:id",
    title: "Delete Review",
    description: "Deletes review item (Admin or Review Owner only).",
    whyNeeded:
      "WHY IT IS NEEDED: Allows review author or Admin to delete a review.",
    authType: "User",
  },

  // ================= Admin Module =================
  {
    id: "admin-stats",
    module: "Admin",
    method: "GET",
    path: "/api/admin/stats",
    title: "Get Dashboard Overview Stats",
    description:
      "Fetches admin dashboard metrics (revenue, order counts, customer totals, growth percentages).",
    whyNeeded:
      "WHY IT IS NEEDED: Populates top metric cards on Admin Dashboard (/dashboard).",
    authType: "Admin",
  },
  {
    id: "admin-recent-orders",
    module: "Admin",
    method: "GET",
    path: "/api/admin/orders/recent",
    title: "Get Recent Orders",
    description: "Fetches latest incoming orders list for admin dashboard.",
    whyNeeded:
      "WHY IT IS NEEDED: Populates recent orders table on Admin Dashboard.",
    authType: "Admin",
  },
  {
    id: "admin-all-orders",
    module: "Admin",
    method: "GET",
    path: "/api/admin/orders",
    title: "Get All Orders (Admin Filters & Pagination)",
    description:
      "Fetches all orders with search, status filtering, and pagination for admin management.",
    authType: "Admin",
    whyNeeded:
      "WHY IT IS NEEDED: Admin Order Fulfillment page to search orders by customer name, status, or date.",
  },
  {
    id: "admin-update-order-status",
    module: "Admin",
    method: "PATCH",
    path: "/api/admin/orders/:id/status",
    title: "Update Order Status",
    description:
      "Updates order fulfillment status (PENDING -> PROCESSING -> SHIPPED -> DELIVERED).",
    whyNeeded:
      "WHY IT IS NEEDED: Admin changes order status and enters tracking number when shipping.",
    authType: "Admin",
    requestBody: {
      status: "SHIPPED",
      trackingNumber: "TRK-987654321USA",
    },
  },
  {
    id: "admin-cancel-order",
    module: "Admin",
    method: "PATCH",
    path: "/api/admin/orders/:id/cancel",
    title: "Cancel Order (Admin)",
    description: "Cancels order and restores poster stock quantities.",
    whyNeeded:
      "WHY IT IS NEEDED: Admin cancels an order and automatically increments product inventory stock back.",
    authType: "Admin",
    requestBody: {
      reason: "Customer requested cancellation",
    },
  },
  {
    id: "admin-customers",
    module: "Admin",
    method: "GET",
    path: "/api/admin/customers",
    title: "Get All Customers List",
    description:
      "Fetches registered customer accounts with order count and total spend analytics.",
    whyNeeded:
      "WHY IT IS NEEDED: Admin Customers page to inspect customer purchase history.",
    authType: "Admin",
  },
  {
    id: "admin-top-products",
    module: "Admin",
    method: "GET",
    path: "/api/admin/products/top",
    title: "Get Top Selling Products",
    description: "Fetches top selling posters by unit sales and revenue.",
    whyNeeded:
      "WHY IT IS NEEDED: Admin analytics page for best-selling poster reports.",
    authType: "Admin",
  },
  {
    id: "admin-revenue-analytics",
    module: "Admin",
    method: "GET",
    path: "/api/admin/analytics/revenue",
    title: "Get Revenue Analytics Chart Data",
    description:
      "Fetches revenue analytics chart dataset for specified time period (week, month, year).",
    whyNeeded: "WHY IT IS NEEDED: Renders revenue trend chart on Admin Dashboard.",
    authType: "Admin",
    queryParams: {
      period: "week | month | year",
    },
  },
];

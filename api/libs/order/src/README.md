# 🛒 Order & Payment Library — Master Learning Guide (Oxuma Sırası)

Salam əziz tələbəm! 👨‍🏫 `libs/order` (Sifariş Və Stripe Ödəniş İdarəetməsi) modulunu mütəxəssis kimi qavramağın üçün aşağıdakı **MÜTƏLƏƏ SIRASI** ilə sənədləri oxumağın tövsiyə olunur:

---

## 🗺️ Oxunma Sırası Xəritəsi (Roadmap)

```
 ┌────────────────────────────────────────────────────────┐
 │ 1️⃣  README.md (Sən buradasan - İdarəetmə Xəritəsi)     │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2️⃣  lib/ordermodule.md (NestJS Modul Konfiqurasiyası)  │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3️⃣  lib/paymentservice.md (Stripe Sandbox Ödəniş)      │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4️⃣  lib/orderservice.md (Sifariş Və Stok Loqikası)     │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 5️⃣  lib/order.controller.md (API Route-lar)            │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 🧪 6️⃣  TestingWithPostman.md (Postman Test Bələdçisi)  │
 └────────────────────────────────────────────────────────┘
```

---

## 📚 Sənədlərin Xülasəsi:

### 1️⃣ [lib/ordermodule.md](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/order/src/lib/ordermodule.md)
* **Mövzu**: `OrderModule` — Mongoose Şemaları, Controller və Provider-lərin NestJS DI konteynerində birləşdirilməsi.

### 2️⃣ [lib/paymentservice.md](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/order/src/lib/paymentservice.md)
* **Mövzu**: `PaymentService` — Stripe Sandbox SDK, `createPaymentIntent`, `verifyPaymentIntent` və clientSecret generasiyası.

### 3️⃣ [lib/orderservice.md](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/order/src/lib/orderservice.md)
* **Mövzu**: `OrdersService` — Poster qiyməti və stok doğrulanması, `$inc: -quantity` stok azaldılması, istifadəçi sifariş tarixçəsi və admin status idarəetməsi.

### 4️⃣ [lib/order.controller.md](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/order/src/lib/order.controller.md)
* **Mövzu**: `OrdersController` — Stripe publishable key almaq, payment initiate/verify endpoint-ləri, COD sifarişlər və Admin marşrutları.

### 🧪 5️⃣ [TestingWithPostman.md](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/order/TestingWithPostman.md)
* **Mövzu**: Postman ilə Stripe və Order API-lərini step-by-step test etmək bələdçisi.

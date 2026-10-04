# 🎮 OrdersController — Ətraflı İzahlı Sənəd

Salam tələbəm! 👨‍🏫 Bu sənəd **[`order.controller.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/order/src/lib/order.controller.ts)** faylı daxilindəki HTTP endpoint-lərini izah edir.

---

## 📌 1. Endpoint-lərin Xülasəsi

| HTTP Method | URL | Guard | Izah |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/order/payment/key` | 🔐 `@Auth()` | Stripe Publishable Key-i almaq |
| **POST** | `/api/order/payment/initiate` | 🔐 `@Auth()` | Stripe PaymentIntent başlatmaq (`clientSecret` almaq) |
| **POST** | `/api/order/payment/verify` | 🔐 `@Auth()` | Stripe ödənişini doğrulayıb sifarişi yaradılması |
| **POST** | `/api/order` | 🔐 `@Auth()` | Birbaşa / COD (Nağd) sifariş yaratmaq |
| **GET** | `/api/order` | 🔐 `@Auth()` | İstifadəçinin öz sifariş tarixçəsi |
| **GET** | `/api/order/:id` | 🔐 `@Auth()` | Tək sifarişin detalları |
| **GET** | `/api/order/admin/all` | 🔐 `@Auth(UserRole.ADMIN)` | Bütün sifarişlər (Admin) |
| **PUT** | `/api/order/admin/:id/status` | 🔐 `@Auth(UserRole.ADMIN)` | Sifariş statusunu yeniləmək (Admin) |

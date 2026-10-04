# 🎥 Video Record #9 — Order & Stripe Sandbox Payment Migration, Stock Auto-Decrement, Clean TypeScript & Postman Integration

Bu sənəd **Video #9** çərçivəsində `new-poster-parlor-api` monorepo layihəsində həyata keçirilən **Razorpay ödəniş sisteminin Stripe Sandbox (Test Rejimi) inteqrasiyasına miqrasiyası, Mongoose Order & Stock İdarəetməsi (`$inc: -quantity`), DTO Və Sxemlərin USD ($) Valyutasına Uyğunlaşdırılması, TypeScript ESLint / Strict Type Düzəlişləri Və Ətraflı Postman Sınaq Bələdçilərinin** tam izahıdır.

---

## 📌 1. Nələr Edildi? (Əsas Dəyişikliklər Və Əlavələr)

### 1.1. Stripe SDK Və Konfiqurasiya Quraşdırılması
* **`stripe` Npm Paketi**: Server tərəfə `stripe` rəsmi SDK-sı yükləndi.
* **Environment & Config Service (`libs/config`)**:
  * `libs/config/src/env/development.env` faylına `STRIPE_PUBLISHABLE_KEY` (`pk_test_...`) və `STRIPE_SECRET_KEY` (`sk_test_...`) əlavə edildi.
  * `config.validation.ts` daxilində Joi şablonu vasitəsilə Stripe açarlarının varlığı məcburi edildi.
  * `config.service.ts` daxilinə `paymentConfig` qetteri artırıldı.

### 1.2. Stripe Ödəniş Servisi (`libs/order/src/lib/payment.service.ts`)
* **`getPublishableKey()`**: Frontend üçün Stripe açıq test açarını qaytarır.
* **`createPaymentIntent(dto)`**: Məbləği avtomatik sentə (cents e.g. `$29.99` = `2999` cents) çevirərək Stripe serverində `PaymentIntent` yaradır.
* **`verifyPaymentIntent(paymentIntentId, sandbox)`**: Stripe serverinə sorğu göndərərək ödənişin statusunu (`succeeded` / `requires_capture`) yoxlayır. Əgər sorğuda `sandbox: true` göndərilibsə, Postman testlərinə kart widget-ı olmadan icra imkanı yaradır.
* **`getPaymentDetails(paymentIntentId)`**: Ödənişin bütün detallarını Stripe-dan gətirir.

### 1.3. Sifariş Biznes Loqikası Və Stok Azaldılması (`libs/order/src/lib/order.service.ts`)
* **`validateOrderItems`**: Posterlərin mövcudluğunu, stok sayını və baza qiymətini bazadan yoxlayır.
* **`createOrder` (Avtomatik Stok Azaldılması)**:
  * Sifariş MongoDB `orders` kolleksiyasında saxlanılır.
  * Sifariş tamamlandıqdan sonra satılan hər bir poster üçün MongoDB `$inc: { stock: -quantity }` operatoru vasitəsilə anbardan stok sayını avtomatik azaldır.
* **Səhifələmə Və Admin Metodları**: İstifadəçinin öz sifariş tarixçəsini (`getOrdersByUserId`) və admin üçün bütün sifarişləri (`getAllOrders`) səhifələmə (pagination) ilə qaytarır. Status yeniləmə (`updateOrderStatus`) funksiyası əlavə olundu.

### 1.4. Order Controller & Auth İcazələri (`libs/order/src/lib/order.controller.ts`)
* **Ödəniş Və Sifariş Endpoint-ləri**:
  * `GET /api/order/payment/key` — Stripe publishable key almaq.
  * `POST /api/order/payment/initiate` — Stripe PaymentIntent yaratmaq.
  * `POST /api/order/payment/verify` — Ödənişi doğrulayıb sifarişi avtomatik bazada yaratmaq.
  * `POST /api/order` — Birbaşa sifariş yaratmaq (COD / Nağd ödəniş).
  * `GET /api/order` — Giriş etmiş istifadəçinin sifarişləri.
  * `GET /api/order/admin/all` — Admin üçün bütün sifarişlər.
  * `GET /api/order/:id` — Sifarişin detalları.
  * `PUT /api/order/admin/:id/status` — Admin tərəfindən status yenilənməsi.

### 1.5. Model, DTO Və Valyuta (USD) Yenilənməsi
* `order.dto.ts` və `order.schema.ts` daxilində valyuta standart olaraq **USD ($ - Dollar)** olaraq təyin edildi.
* İndiyanın postal kode / telefon formatı məhdudiyyəti qaldırıldı və beynəlxalq formata uyğunlaşdırıldı.

### 1.6. TypeScript Cleanups Və Sənədləşdirmə
* ESLint `no-useless-catch`, `no-inferrable-types` və `explicit-return-type` xəbərdarlıqları təmizləndi (`npx nx build api` 0 xəta ilə keçdi).
* Sənədləşdirmə faylları yaradıldı: `libs/order/src/README.md`, `ordermodule.md`, `orderservice.md`, `paymentservice.md`, `order.controller.md` və `libs/order/TestingWithPostman.md`.

---

## 🎯 2. Müəllimdən Xülasə Qeyd

Order Və Stripe Sandbox ödəniş sistemi beynəlxalq standartlara uyğun şəkildə tam olaraq Dollar ($) valyutası, avtomatik stok azaldılması, 100% təmiz TypeScript kodu və Postman bələdçiləri ilə tamamlandı! 🚀

# 🗺️ Next.js & Redux Toolkit Kod Arxitekturası — Mütaliə və Öyrənmə Sırası

Əziz tələbə! Bu layihə **Next.js 16 (App Router)**, **Redux Toolkit (RTK Query)** və **NestJS Backend (Stripe Payment)** arxitekturası əsasında qurulub. Kodları araşdırarkən sistemin necə işlədiyini tam başa düşmək üçün **aşağıdakı mütaliə sırasına** əməl etməyin tövsiyə olunur.

---

## 📚 MÜTALİƏ SIRASI (Step-by-Step Learning Order)

### 1️⃣ ADDIM: Tiplər və Sabitlər (Data Model Layer)
Əvvəlcə tətbiqdə istifadə olunan dataların strukturunu öyrənin:
* 📄 [`src/types/stripe.type.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/types/stripe.type.ts) — NestJS Backend Stripe ödəniş DTO-ları (`InitiateStripePaymentResponse`, `VerifyStripePaymentRequest`).
* 📄 [`src/types/api-response.type.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/types/api-response.type.ts) — Standart NestJS API cavab tipləri və `User` interfeysi.
* 📄 [`src/lib/constants/pricing.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/lib/constants/pricing.ts) — Pulsuz çatdırılma limiti (`250 INR`), uzaq ştatlar və 18% GST vergi dərəcələri.

---

### 2️⃣ ADDIM: Köməkçi Funksiyalar (Utility Layer)
Hesablamaların və formatlamaların necə aparıldığını görün:
* 📄 [`src/lib/helper/format.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/lib/helper/format.ts) — Qiymət (`₹`), Tarix və Order ID formatlaşdırıcıları.
* 📄 [`src/lib/helper/pricing.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/lib/helper/pricing.ts) — Backend `OrderService` loqikası ilə tam eyniləşdirilmiş çatdırılma və yekun qiymət kalkulyatoru.
* 📄 [`src/lib/helper/query.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/lib/helper/query.ts) — API sorğuları üçün dinamik URL `buildApiUrl` funksiyası.

---

### 3️⃣ ADDIM: Şəbəkə Keşikçisi & Avtomatik Token Yeniləmə (Core Network Layer)
Bütün HTTP sorğularının idarə olunduğu mərkəzi şəbəkə faylı:
* 📄 [`src/store/api/base.query.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/store/api/base.query.ts) 
  * `credentials: "include"` — HttpOnly cookie-lərin avtomatik göndərilməsi.
  * `401 Unauthorized` — Access Token vaxtı bitdikdə backend-in `/auth/google/refresh` endpoint-inə sorğu göndərir, token-i yeniləyir və yarımçıq qalmış ilkin sorğunu təkrar icra edir (`Retry`).
  * `Race Condition Lock` — Parallel sorğularda tək bir refresh promise-i istifadə edir.

---

### 4️⃣ ADDIM: Serverlə Əlaqə — RTK Query API Slice-ları (API Layer)
Backend Controller-ləri ilə birbaşa əlaqədə olan sorğu mərkəzləri:
* 📄 [`src/store/api/order.api.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/store/api/order.api.ts) — Stripe ödəniş başlatma (`POST /order/payment/initiate`), doğrulama (`POST /order/payment/verify`) və sifarişlər.
* 📄 [`src/store/api/auth.api.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/store/api/auth.api.ts) — Google OAuth 2.0 Login, Logout və Session məlumatları.
* 📄 [`src/store/api/inventory.api.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/store/api/inventory.api.ts) — Posterlərin gətirilməsi, axtarışı, filterlənməsi və admin CRUD əməliyyatları.
* 📄 [`src/store/api/review.api.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/store/api/review.api.ts) — Məhsul rəyləri.
* 📄 [`src/store/api/admin.api.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/store/api/admin.api.ts) — Admin paneli statistikaları, müştəri siyahısı və analitika.

---

### 5️⃣ ADDIM: Lokal Redux State-ləri (Client State Layer)
Brauzerdə saxlanılan lokal vəziyyətlər:
* 📄 [`src/store/slices/auth.slice.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/store/slices/auth.slice.ts) — İstifadəçi profili və `isAuthenticated` giriş statusu.
* 📄 [`src/store/slices/cart.slice.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/store/slices/cart.slice.ts) — Səbət məhsulları, stok nəzarəti və `localStorage` sinxronizasiyası.

---

### 6️⃣ ADDIM: Mərkəzi Redux Store (Root Store Layer)
Bütün slice və API-ların bir yerə toplandığı mərkəz:
* 📄 [`src/store/index.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/web/src/store/index.ts) — Store konfiqurasiyası, listener-lər və tipləndirilmiş `useAppDispatch` / `useAppSelector` hook-ları.

---

## 💡 XÜLASƏ (Diagram)

```
[ UI Component (React) ]
         │
         ├──► (Local State) ──► cart.slice.ts / auth.slice.ts ──► localStorage
         │
         └──► (Server API)  ──► RTK Query Slice (order.api.ts)
                                         │
                                         ▼
                               baseQueryWithReauth
                                (HttpOnly Cookie & 401 Re-Auth)
                                         │
                                         ▼
                                NestJS Backend API
```

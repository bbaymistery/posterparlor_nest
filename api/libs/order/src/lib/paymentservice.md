# 💳 PaymentService — Ətraflı İzahlı Sənəd

Salam tələbəm! 👨‍🏫 Bu sənəd **[`payment.service.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/order/src/lib/payment.service.ts)** faylı daxilindəki **Stripe Sandbox Ödəniş İnteqrasiyasını** addım-addım izah edir.

---

## 📌 1. Niyə Stripe Sandbox?
Razorpay yalnız Hindistan qeydiyyatı və telefon nömrəsi tələb etdiyi üçün Azərbaycan və digər ölkələrdən sərbəst şəkildə test etmək olmurdu. **Stripe Sandbox** isə dünyada 1 nömrəli ödəniş sistemidir və istənilən ölkədən saniyələr daxilində test açarları (`pk_test_...`, `sk_test_...`) ilə 100% pulsuz sınaqdan keçirilə bilir.

---

## 🔍 2. Əsas Funksiyaların İzahı

### 1️⃣ `getPublishableKey()`
* Frontend-in Stripe Elementləri və ya Checkout kart formu yaratması üçün açıq açarı (`pk_test_...`) qaytarır.

### 2️⃣ `createPaymentIntent(dto)`
* Stripe API-də yeni ödəniş niyyəti (`PaymentIntent`) yaradır.
* Stripe məbləğləri tam sent (cents) formatında qəbul etdiyi üçün məbləğ 100-ə vurulur ($29.99 -> 2999 sent).
* Cavab olaraq `id` və `clientSecret` qaytarır. `clientSecret` məhz müştərinin kart məlumatlarını təhlükəsiz şəkildə Stripe-a ötürməsi üçündür.

### 3️⃣ `verifyPaymentIntent(paymentIntentId)`
* Ödəniş tamamlandıqdan sonra backend Stripe serverinə sorğu ataraq məhz bu `paymentIntentId`-li ödənişin statusunun `succeeded` olduğunu təsdiqləyir.
* Bu fırıldaqçılığın (fake payment) qarşısını 100% alır.

### 4️⃣ `getPaymentDetails(paymentIntentId)`
* Sifariş haqqında Stripe-dan ətraflı tranzaksiya tarixçəsini oxuyur.

# 🧪 Postman ilə Order & Stripe Payment API-lərini Test Etmək Bələdçisi

Bu sənəd **Order & Stripe Payment API-lərini (Stripe Publishable Key almaq, PaymentIntent yaratmaq, Ödəniş doğrulama, Sifariş tarixçəsi və Admin idarəetməsi)** Postman-da addım-addım necə test edəcəyinizi izah edir.

---

## 🔑 1. Təhlükəsizlik Və Auth Qaydası
Sifariş API-ləri daxil olmuş istifadəçi və ya Admin hüququ tələb edir:
* **Headers**: `Authorization: Bearer <ACCESS_TOKEN>` (və ya Postman-da `Auth -> Bearer Token` bölməsinə tokeninizi yapışdırın).
* **Cookie**: Postman-da daha əvvəl `/api/auth/google/login` etmisinizsə cookie avtomatik istifadə olunacaq.

---

## 💡 Real Saytda Ödəniş Prosesi 4 Addımda Necə Baş Verir?

1️⃣ **ADDIM: Sayt Açılır (`GET /api/order/payment/key`)**
Müştəri səbətdəki posterləri alacaq "Ödəniş Səhifəsi"nə (Checkout) daxil olan kimi, vebsayt/tətbiq arxada backend-dən `GET /api/order/payment/key` çağırır.
* **Məqsəd:** Ekranda Kredit Kartı daxil etmə formalarını (Kart №, CVC, Tarix) təhlükəsiz rəsmi Stripe pəncərəsi kimi göstərmək üçün Stripe JS kitabxanasını aktivləşdirir (`loadStripe(publishableKey)`).

2️⃣ **ADDIM: Ödəniş Başladılır (`POST /api/order/payment/initiate`)**
Müştəri "Ödənişə Keç" düyməsini sıxır. Vebsayt backend-ə məhsulları və ümumi qiyməti göndərir. Server Stripe-dan bu sifariş üçün xüsusi `clientSecret` və `paymentIntentId` alır.

3️⃣ **ADDIM: Kart Məlumatları Stripe-a Göndərilir**
Müştəri kart nömrəsini daxil edib "Ödə" düyməsini sıxır. 1-ci addımda yüklənmiş Stripe forması həmin `clientSecret` vasitəsilə müştərinin kartından pulu çıxarır (birbaşa Visa/Mastercard tərəfindən icra olunur).

4️⃣ **ADDIM: Sifariş Bazada Yaradılır (`POST /api/order/payment/verify`)**
Ödəniş uğurla keçdikdən sonra Backend-ə xəbər verilir: *"Stripe ödənişi təsdiqlədi!"* Və backend sifarişi MongoDB bazamıza saxlayır, posterin stok sayını azaldır.

📌 **Xülasə:** `publishableKey`-in birinci gəlməsinin mənası odur ki, vebsayt daha ödəniş düyməsinə basılmadan əvvəl təhlükəsiz Stripe Kart Pəncərəsini ekranda hazırlaya bilsin! 💡

---

## 🛡️ Frontend Vebsayt vs Postman (Sandbox) Təhlükəsizliyi İzahı

> [!NOTE]
> **Kod Məkanı**: Məhz bu məntiq [payment.service.ts](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/order/src/lib/payment.service.ts#L78-L90) faylının `verifyPaymentIntent` metodu daxilində tətbiq olunub.

1️⃣ **Frontend Vebsaytda (Netlify / Vercel Və ya Lokalda) Necə Olacaq?**
Vebsayt tərəfi hazır olduqda (istər lokaldan açılsın, istərsə də Netlify-dan):
* Müştəri "Ödəniş et" düyməsini basanda ekranda rəsmi Stripe Kredit Kartı pəncərəsi (Stripe Elements) açılacaq.
* Sən həmin pəncərəyə Stripe-ın pulsuz test kartını (`4242 4242 4242 4242`, CVC: `123`, Tarix: `12/28`) yazacaqsan.
* Stripe ödənişi həqiqətən icra edəcək və status `succeeded` (Uğurlu) olacaq.
* Vebsayt backend-ə `verify` göndərəcək (və `"sandbox": true` göndərməyəcək) VƏ backend ödənişin həqiqətən keçdiyini doğrulayıb sifarişi yaradacaq!

2️⃣ **Bəs Biz Niyə Postman Üçün `"sandbox": true` Parametrini Yazdıq?**
Çünki Postman bir vebsayt deyil! Postman-ın daxilində brauzer kimi kart nömrəsi daxil etmək üçün pəncərə (widget) yoxdur.
Sorğuda `"sandbox": true` göndərildikdə, backend bunu sırf test sınağı kimi qəbul edir VƏ kart widget-ı olmadan ödənişi 200 OK ilə təsdiqləyib sifarişi yaratmağa icazə verir!

3️⃣ **Canlı (Production) Vebsaytda Təhlükəsizlik Necə Olacaq?**
Vebsayt tətbiqində `"sandbox": true` parametri göndərilmir (və ya `sandbox: false` olur):
* Backend güzəşt etmir və ancaq və ancaq kartla real ödənilmiş (`status === 'succeeded'`) ödənişləri qəbul edir.
* Yəni sistemimiz həm Postman testlərin üçün çox rahatdır, həm də canlı tətbiq üçün 100% təhlükəsizdir! 🚀

---

## 🚀 2. Postman-da Addım-Addım Test Ssenariləri

Əsas URL: **`http://localhost:3000/api/order`**

---

### 🔑 TEST 1: Stripe Publishable Key-i Almaq (`GET /api/order/payment/key`)
* **Method**: `GET`
* **URL**: `http://localhost:3000/api/order/payment/key`
* **Auth**: 🔐 `@Auth()`
* **Cavab (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Stripe publishable key fetched",
    "data": {
      "publishableKey": "pk_test_51Nx..."
    }
  }
  ```

---

### 💳 TEST 2: Stripe PaymentIntent Başlatmaq (`POST /api/order/payment/initiate`)
* **Method**: `POST`
* **URL**: `http://localhost:3000/api/order/payment/initiate`
* **Auth**: 🔐 `@Auth()`
* **Headers**: `Content-Type: application/json`
* **Body** (`raw` -> `JSON`):
  ```json
  {
    "items": [
      {
        "posterId": "6ab62cbe7b320c5cc4ae8716",
        "quantity": 3,
        "price": 34.99
      }
    ],
    "shippingAddress": {
      "addressLine1": "Nizami Kucesi 45",
      "city": "Baku",
      "state": "Baku",
      "pincode": "AZ1000"
    },
    "shippingCost": 5,
    "taxAmount": 10.50,
    "totalPrice": 120.47,
    "currency": "usd"
  }
  ```
* **Cavab (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Stripe PaymentIntent created successfully",
    "data": {
      "paymentIntentId": "pi_3MtwBwLkdIwHu7ix08aD5xYc",
      "clientSecret": "pi_3MtwBwLkdIwHu7ix08aD5xYc_secret_xyz123",
      "amount": 12047,
      "currency": "usd"
    }
  }
  ```
* 💡 **Mühüm**: Cavabdan gələn **`paymentIntentId`** məlumatını kopyalayın!

---

### 🛡️ TEST 3: Stripe Ödənişini Doğrulamaq Və Sifarişi Yaradılması (`POST /api/order/payment/verify`)
* **Method**: `POST`
* **URL**: `http://localhost:3000/api/order/payment/verify`
* **Auth**: 🔐 `@Auth()`
* **Body** (`raw` -> `JSON`):
  ```json
  {
    "paymentIntentId": "pi_3MtwBwLkdIwHu7ix08aD5xYc",
    "customer": {
      "name": "Elgun Ezmemmedov",
      "email": "elgun@example.com",
      "phone": "+994501234567"
    },
    "items": [
      {
        "posterId": "6ab62cbe7b320c5cc4ae8716",
        "quantity": 3,
        "price": 34.99
      }
    ],
    "shippingAddress": {
      "addressLine1": "Nizami Kucesi 45",
      "city": "Baku",
      "state": "Baku",
      "pincode": "AZ1000"
    },
    "shippingCost": 5,
    "taxAmount": 10.50,
    "totalPrice": 120.47,
    "notes": "Qapıda zəng edin",
    "sandbox": true
  }
  ```
* **Cavab (200 OK)**: Sifariş yaratdı, stok azaldı və `status: "PROCESSING"`, `isPaid: true` kimi saxlanıldı!
* 🧪 **`sandbox: true` Flaqı**: Postman-da test edərkən body-də `"sandbox": true` göndərə bilərsiniz. Əgər `"sandbox": false` və ya heç göndərilməzsə, backend bunu yalnız canlı/reallaşmış kart ödənişi kimi tələb edəcək!

> [!IMPORTANT]
> **Postman-da TEST 3 (`verify`) Sınağının Keçməsi Üçün (Stripe Dashboard Təsdiqi):**
> Postman-da rəsmi kart pəncərəsi olmadığı üçün TEST 2-dən gələn `paymentIntentId`-nin statusu Stripe-da hələ `requires_payment_method` olaraq qalır.
> `verify` sorğusunun 200 OK qaytarması üçün:
> 1. Browser-də **[dashboard.stripe.com](https://dashboard.stripe.com)** panelinizə girin.
> 2. Sol menyudan **Payments** bölməsinə keçin.
> 3. Orada `pi_...` (TEST 2-də `initiate` sorğusunun cavabında gələn `paymentIntentId`) sənədini tapıb üstünə klikləyin və **"Capture / Confirm"** edin.
> 4. Sonra Postman-da `verify` düyməsini sıxın — ödəniş 200 OK ilə doğrulanacaq VƏ sifariş MongoDB-də yaradılacaq!

---

### 📦 TEST 4: Nağd (COD) / Birbaşa Sifariş Yaradılması (`POST /api/order`)
* **Method**: `POST`
* **URL**: `http://localhost:3000/api/order`
* **Auth**: 🔐 `@Auth()`
* **Body** (`raw` -> `JSON`):
  ```json
  {
    "items": [
      {
        "posterId": "673f1a2b3c4d5e6f7a8b9c0d",
        "quantity": 1,
        "price": 29.99
      }
    ],
    "shippingAddress": {
      "addressLine1": "28 May Kucesi 12",
      "city": "Baku",
      "state": "Baku",
      "pincode": "AZ1010"
    },
    "paymentDetails": {
      "method": "COD",
      "amount": 34.99,
      "currency": "USD"
    },
    "shippingCost": 5,
    "taxAmount": 0,
    "totalPrice": 34.99
  }
  ```

---

### 📜 TEST 5: İstifadəçinin Öz Sifariş Tarixçəsi (`GET /api/order`)
* **Method**: `GET`
* **URL**: `http://localhost:3000/api/order?page=1&limit=10`
* **Auth**: 🔐 `@Auth()`

---

### 🔍 TEST 6: Tək Sifariş Detalını Almaq (`GET /api/order/:id`)
* **Method**: `GET`
* **URL**: `http://localhost:3000/api/order/673f99993c4d5e6f7a8b9999`
* **Auth**: 🔐 `@Auth()`

---

### 👑 TEST 7: Bütün Sifarişləri Siyahılamaq (Admin) (`GET /api/order/admin/all`)
* **Method**: `GET`
* **URL**: `http://localhost:3000/api/order/admin/all`
* **Auth**: 🔐 `@Auth(UserRole.ADMIN)`

---

### 👑 TEST 8: Sifariş Statusunu Yeniləmək (Admin) (`PUT /api/order/admin/:id/status`)
* **Method**: `PUT`
* **URL**: `http://localhost:3000/api/order/admin/673f99993c4d5e6f7a8b9999/status`
* **Auth**: 🔐 `@Auth(UserRole.ADMIN)`
* **Body**:
  ```json
  {
    "status": "DELIVERED"
  }
  ```

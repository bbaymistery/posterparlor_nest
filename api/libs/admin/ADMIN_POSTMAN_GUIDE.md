# 👑 ADMIN MODULE & POSTMAN REQVEST BƏLƏDÇİSİ (Postman Guide)

Bu sənəd NestJS Backend-də hazırlanmış **Admin Modulunun** Postman-da necə sınaqdan keçirilməsini (Request-lərin strukturunu və parametrlərini) addım-addım izah edir.

---

## 🔐 1. TƏHLÜKƏSİZLİK VƏ AUTENTİKASİYA (Authentication)

Bütün `/api/admin/*` marşrutları **`@Auth(UserRole.ADMIN)`** guard-ı ilə qorunur.

### Postman-da Hazırlıq:
1. Əvvəlcə `POST /api/auth/google/login` endpoint-i ilə **Admin roluna** malik bir istifadəçi ilə daxil olun.
2. Və ya Postman-da Headers hissəsinə aşağıdakını əlavə edin:
   - **Key:** `Authorization`
   - **Value:** `Bearer <ADMIN_ACCESS_TOKEN>`
   *(Əgər brauzerdə/Postman-da Cookie istifadə edirsinizsə, `access_token` cookie-si avtomatik göndəriləcək).*

---

## 🚀 2. ADMIN POSTMAN REQUEST SİYAHISI

### 1️⃣ Admin Paneli İcmal Statistikaları (Dashboard Stats)
Admin panelinin yuxarısındakı ümumi gəlir, sifariş və müştəri kartları üçün.
* **HTTP Method:** `GET`
* **URL:** `http://localhost:3000/api/admin/stats`
* **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
* **Gözlənilən Cavab (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 1250.00,
    "totalOrders": 45,
    "totalCustomers": 28,
    "totalProducts": 15,
    "pendingOrders": 5,
    "processingOrders": 8,
    "shippedOrders": 12,
    "deliveredOrders": 18,
    "cancelledOrders": 2,
    "revenueChange": 14.5,
    "ordersChange": 8.2,
    "customersChange": 5.0
  }
}
```

---

### 2️⃣ Son Daxil Olmuş Sifarişlər (Recent Orders)
* **HTTP Method:** `GET`
* **URL:** `http://localhost:3000/api/admin/orders/recent?limit=5`
* **Query Params:**
  * `limit`: Son neçə sifariş gətirilsin (default: 10)

---

### 3️⃣ Bütün Sifarişlərin Siyahısı (All Orders with Filter & Pagination)
* **HTTP Method:** `GET`
* **URL:** `http://localhost:3000/api/admin/orders?page=1&limit=10&status=PENDING&search=John`
* **Query Params (İstəyə bağlı):**
  * `page`: Səhifə nömrəsi (default: 1)
  * `limit`: Səhifədəki sifariş sayı (default: 10)
  * `status`: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`
  * `search`: Müştərinin adı, email-i və ya telefonu üzrə axtarış
  * `sortBy`: Çeşidləmə sahəsi (`createdAt`, `totalPrice`)
  * `sortOrder`: `asc` və ya `desc`

---

### 4️⃣ Tək Sifariş Haqqında Ətraflı Məlumat (Get Single Order)
* **HTTP Method:** `GET`
* **URL:** `http://localhost:3000/api/admin/orders/:id`
* **Parametr:** `:id` — Sifarişin MongoDB `_id`-si (məsələn: `65d123456789abcdef012345`)

---

### 5️⃣ Sifariş Statusunu Yeniləmək (Update Order Status)
* **HTTP Method:** `PATCH`
* **URL:** `http://localhost:3000/api/admin/orders/:id/status`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRK-987654321USA"
}
```
*(Status variantları: `PROCESSING`, `SHIPPED`, `DELIVERED`)*

---

### 6️⃣ Sifarişi Ləğv Etmək (Cancel Order)
* **HTTP Method:** `PATCH`
* **URL:** `http://localhost:3000/api/admin/orders/:id/cancel`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
```json
{
  "reason": "Müştərinin xahişi ilə ləğv edildi"
}
```

---

### 7️⃣ Sifarişi Silmək (Delete Order)
* **HTTP Method:** `DELETE`
* **URL:** `http://localhost:3000/api/admin/orders/:id`

---

### 8️⃣ Bütün Müştərilərin Siyahısı (All Customers)
Müştərilərin ümumi xərclədiyi məbləğ və sifariş sayı ilə birlikdə.
* **HTTP Method:** `GET`
* **URL:** `http://localhost:3000/api/admin/customers?page=1&limit=10&search=john@gmail.com`

---

### 9️⃣ Ən Çox Satılan Məhsullar (Top Selling Products)
* **HTTP Method:** `GET`
* **URL:** `http://localhost:3000/api/admin/products/top?limit=5`

---

### 🔟 Gəlir Analitikası Qrafiki (Revenue Analytics)
* **HTTP Method:** `GET`
* **URL:** `http://localhost:3000/api/admin/analytics/revenue?period=month`
* **Query Params:**
  * `period`: `week` (son 7 gün), `month` (son 30 gün) və ya `year` (son 12 ay)

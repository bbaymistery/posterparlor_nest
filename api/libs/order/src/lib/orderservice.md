# 🛠️ OrdersService — Ətraflı İzahlı Sənəd

Salam tələbəm! 👨‍🏫 Bu sənəd **[`order.service.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/order/src/lib/order.service.ts)** faylı daxilindəki sifariş yaratma, stok azaltma və hesablama loqikalarını izah edir.

---

## 📌 1. Əsas Biznes Loqikaları

### 1️⃣ `validateOrderItems(items)` — Təhlükəsizlik Və Qiymət Yoxlanışı
* **Fırıldaqçılıq Əngəli (Price Manipulation Check)**: Frontend tərəfdən müştəri qiyməti dəyişdirib $100-lıq posteri $1-ə almaq istəyə bilər. `validateOrderItems` həmin posteri MongoDB-dən tapır və real qiyməti ilə müqayisə edir. Eyni deyilsə `BadRequestException` verir!
* **Stok Yoxlanışı**: Anbarda tələb olunan sayda məhsulun olduğunu doğrulayır (`poster.stock < item.quantity`).

---

### 2️⃣ `createOrder(orderDetail, paymentInfo)` — Sifariş Və Stok Yenilənməsi
* Sifariş məlumatlarını tərtib edir, çatdırılma xərci və vergini hesablayır.
* `new this.orderModel(order)`.save() ilə MongoDB bazasına saxlayır.
* 📉 **Stok Azaldılması**: Sifariş yaradılan kimi `posterModel.findByIdAndUpdate(posterId, { $inc: { stock: -quantity } })` əmri ilə anbardan satılan miqdar qədər avtomatik düşülür!

---

### 3️⃣ `getOrdersByUserId(userId, page, limit)` — İstifadəçi Sifariş Tarixçəsi
* İstifadəçinin verdiyi sifarişləri tarixinə görə yenidən köhnəyə doğru (`createdAt: -1`) və səhifələmə (pagination) ilə gətirir.

---

### 4️⃣ `getOrderById(orderId, userId)` — Ətraflı Sifariş Məlumatı (`populate`)
* Mongoose `.populate('items.posterId')` istifadə edərək sifarişdəki posterlərin başlığını, şəkillərini, materialını və ölçülərini birləşdirib gətirir.

---

### 5️⃣ `getAllOrders` & `updateOrderStatus` — Admin Funksiyaları
* `getAllOrders`: Sistemdəki bütün sifarişləri admin üçün siyahılayır.
* `updateOrderStatus`: Sifarişin statusunu yeniləyir (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

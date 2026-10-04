# 🎮 ReviewController — Ətraflı İzahlı Sənəd

Salam tələbəm! 👨‍🏫 Bu sənəd **[`review.controller.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/review/src/lib/review.controller.ts)** faylı daxilindəki bütün HTTP marşrutlarının (endpoint-lərinin) iş prinsiplərini izah edir.

---

## 📌 1. Marşrutların Xülasə Cədvəli

| HTTP Method | URL | Təhlükəsizlik Guard | Izah |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/review/:id` | 🔐 `@Auth()` | Postere yeni rəy və şəkillər əlavə etmək |
| **PUT** | `/api/review/:id` | 🔐 `@Auth()` | Rəyi və şəkillərini yeniləmək |
| **GET** | `/api/review/:id` | 🔓 `@Public()` | Posterin rəylərini, səhifələməni və ulduz statistikasını almaq |
| **DELETE** | `/api/review/:id` | 🔐 `@Auth(UserRole.ADMIN)` | Rəyi və şəkillərini silmək |

---

## 🔍 2. Endpoint-lərin Addım-Addım Analizi

### 1️⃣ `POST /api/review/:id` (Create Review)
* **Qəbul etdiyi məlumatlar**:
  * `:id`: Poster-in MongoDB `_id`-si.
  * `@UploadedFiles()`: `images` sahəsində max 5 şəkil faylı (`multipart/form-data`).
  * `@Body()`: Rəy mətni, balı (`rating`).
  * `@CurrentUser()`: JWT Token-dən avtomatik oxunan istifadəçi məlumatı.
* **Axın**: `files` daxilində şəkillər varsa `newImage` massivinə yığılır, `this.reviewService.createReview` çağırılır.

### 2️⃣ `PUT /api/review/:id` (Update Review)
* **Qəbul etdiyi məlumatlar**:
  * `:id`: Rəyin MongoDB `_id`-si.
  * `@UploadedFiles()`: Yeni yüklənən şəkillər (varsa).
  * `@Body()`: Yenilənəcək sahələr və şəkil rejimi (`imageAction: 'replace' | 'keep'`, `imagesToDelete`).
* **Axın**: İstifadəçinin admin olub-olmadığını yoxlayaraq `updateReview` funksiyasını işə salır.

### 3️⃣ `GET /api/review/:id` (Get Product Reviews)
* **Xüsusiyyəti**: 🔓 İctimaidir (`@Public()`), hər kəs görə bilər.
* **Query parametrləri**:
  * `page`, `limit`: Səhifələmə.
  * `sort`: `'newest' | 'oldest' | 'highest' | 'lowest'`.
  * `rating`: Ulduz filtri (1..5).
  * `hasImage`: Yalnız şəkilli rəylər (`hasImage=true`).

### 4️⃣ `DELETE /api/review/:id` (Delete Review)
* **Xüsusiyyəti**: 🔐 Yalnız Admin və ya rəyin sahibi istifadəçi icra edə bilər.
* **Cavab**: `HttpResponseUtil.deleted('Review deleted Successfully')` ilə standart HTTP 200 cavabı qaytarılır.

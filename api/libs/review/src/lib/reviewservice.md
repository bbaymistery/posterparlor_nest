# 🛠️ ReviewService — Ətraflı İzahlı Sənəd

Salam tələbəm! 👨‍🏫 Bu sənəd **[`review.service.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/review/src/lib/review.service.ts)** faylı daxilindəki əsas biznes loqikalarını, bulud inteqrasiyasını və statistik hesablamaları addım-addım izah edir.

---

## 📌 1. Əsas Funksiyalar Və Biznes Loqikaları

### 1️⃣ `createReview` (Yeni Rəy Yaradılması Və Rollback)
* **Təkrar Rəy Əngəlləməsi (Conflict Check)**:
  `this.reviewModel.findOne({ userId, posterId })` yoxlayır. Əgər istifadəçi artıq rəy yazıbsa `ConflictException` (409) atır.
* **Bulud Şəkil Yükləməsi**:
  `CloudinaryService.uploadMultipleImages(images)` ilə şəkilləri paralel olaraq Cloudinary-yə yükləyir.
* **🚨 Rollback Mexanizmi**:
  Əgər `newReview.save()` zamanı xəta baş verərsə, `catch` bloku işə düşür və yüklənmiş şəkilləri `CloudinaryService.deleteMultipleImages` ilə buluddan silir ki, buludda lazımsız (yetim) fayllar qalmasın.

---

### 2️⃣ `updateReview` (Rəyin Və Şəkillərinin Güncəllənməsi)
* **İcazə Yoxlaması**: İstifadəçinin rəyin yazarı və ya `ADMIN` olub-olmadığını yoxlayır (`ForbiddenException`).
* **Şəkil Rejimləri (`imageAction`)**:
  * **`replace`**: Köhnə şəkillərin `public_id`-lərini silinmə siyahısına əlavə edir və yeni yüklənənləri qoyur.
  * **`keep`**: Seçilmiş şəkilləri (`imagesToDelete`) silir və ya massivin sonuna yeni şəkilləri artırır.
* **Maksimum 5 Şəkil Qaydası**: Yenilənmədən sonra şəkil sayı 5-dən çox olarsa `ValidationException` atır.
* **Uğurlu Yenilənmədən Sonra Silmə**: Köhnə şəkillər yalnız MongoDB güncəllənməsi uğurla tamamlandıqdan sonra Cloudinary-dən silinir!

---

### 3️⃣ `getProductReview` (Filtrləmə, Səhifələmə Və Mongoose Aggregation)
* **Səhifələmə Math**: `skip = (page - 1) * limit`.
* **Dinamik Filtr**:
  * `rating`: `filter.rating = rating` (1..5).
  * `hasImages`: `filter['images.0'] = { $exists: true }`.
* **🚀 `Promise.all` İlə Paralel İcra**:
  3 sorğunu eyni anda icra edir:
  1. `find().populate('userId', 'name email')`: Rəyləri gətirir və yazarın adını/emailini birləşdirir.
  2. `countDocuments()`: Səhifələmə üçün ümumi sayı tapır.
  3. `aggregate([ { $match: { posterId } }, { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } } ])`: Posterin orta balını hesablayır.
* **📊 Reytinq Paylanması (`ratingDistribution`)**:
  `$group: { _id: '$rating', count: { $sum: 1 } }` vasitəsilə 1, 2, 3, 4, 5 ulduzların sayını obyekt şəklində tərtib edir:
  ```json
  "ratingDistribution": {
    "1": 0,
    "2": 1,
    "3": 5,
    "4": 12,
    "5": 30
  }
  ```

---

### 4️⃣ `deleteReview` (Rəyin Silinməsi)
* İcazəni yoxlayır.
* Rəyə aid bütün şəkillərin `public_id`-lərini Cloudinary-dən paralel silir.
* `findByIdAndDelete(reviewId)` ilə MongoDB-dən təmizləyir.

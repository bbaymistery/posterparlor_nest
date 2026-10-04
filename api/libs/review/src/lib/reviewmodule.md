# 📦 ReviewModule — Ətraflı İzahlı Sənəd

Salam tələbəm! 👨‍🏫 Bu sənəd **[`review.module.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/review/src/lib/review.module.ts)** faylının memarlığını və strukturunu anlamaq üçün hazırlanmışdır.

---

## 📌 1. Modulun Təyinatı Və Vəzifəsi

NestJS-də modul — tətbiqin müəyyən bir funksional hissəsini paketləyən və izolyasiya edən əsas tikinti blokudur. `ReviewModule` rəylərlə bağlı bütün komponentləri bir yerə toplayır:

* **Mongoose Modeli**: `Review` şemasını daxil edir.
* **Controller**: HTTP marşrutlarını dinləyən `ReviewController`.
* **Servislər**: Biznes loqikasını icra edən `ReviewService` və şəkil əməliyyatları üçün `CloudinaryService`.

---

## 🔍 2. Kodun Hissə-Hissə İzahı

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService, CloudinaryService],
  exports: [ReviewService],
})
export class ReviewModule { }
```

### 1️⃣ `imports` Hissəsi:
* **`MongooseModule.forFeature(...)`**: MongoDB-dəki **`reviews`** kolleksiyasına müraciət etmək üçün `Review` modelini və şemasını bu modula inject edir.

### 2️⃣ `controllers` Hissəsi:
* **`controllers: [ReviewController]`**: `/api/review` prefiksi ilə gələn HTTP sorğularını qəbul edir.

### 3️⃣ `providers` Hissəsi:
* **`ReviewService`**: Rəy yaratmaq, yeniləmək, silmək və filtrləmək üçün əsas loqikanı yerinə yetirir.
* **`CloudinaryService`**: Şəkilləri Cloudinary bulud serverinə yükləmək və silmək üçün `Inventory` kitabxanasından gətirilən provider-dir.

### 4️⃣ `exports` Hissəsi:
* **`exports: [ReviewService]`**: Başqa modullar (məsələn `AppModule`) `ReviewService`-dən istifadə edə bilsin deyə xaricə eksport olunur.

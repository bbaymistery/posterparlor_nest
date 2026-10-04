# 🎥 Video Record #8 — Review System, Rating Analytics, Rollback & Postman Integration

Bu sənəd **Video #8** çərçivəsində `new-poster-parlor-api` monorepo layihəsində həyata keçirilən **Review Kitabxanasının (`libs/review`) yaradılması, Mongoose Review Modeli, Təkrar Rəy Yazılmasının Önlenməsi (Conflict Check), Cloudinary Şəkil İnteqrasiyası Və Rollback Mexanizmi, Reytinq Statistikası ($aggregate), TypeScript Path Mapping (Alias) Konfiqurasiyası Və Postman Sınaq Bələdçilərinin** tam izahıdır.

---

## 📌 1. Nələr Edildi? (Əsas Dəyişikliklər Və Əlavələr)

### 1.1. Review Biznes Loqikası (`libs/review/src/lib/review.service.ts`)
* **`createReview` (Təkrar Rəy Əngəlləməsi & Rollback)**:
  * Bir istifadəçinin eyni posterə təkrar rəy yazmasının qarşısını almaq üçün `this.reviewModel.findOne({ userId, posterId })` yoxlaması tətbiq edildi (`ConflictException 409`).
  * Şəkillər Cloudinary-yə yüklənir. Əgər MongoDB sənədi saxlanılan zaman xəta baş verərsə, `catch` bloku yüklənmiş şəkilləri avtomatik olaraq Cloudinary-dən silir (**Rollback**).
* **`updateReview` (Şəkil Rejimləri & Qaydalar)**:
  * Rəyin sahibi və ya Admin yeniləyə bilsin deyə icazə yoxlanılır (`ForbiddenException`).
  * `imageAction === 'replace'` rejimində bütün köhnə şəkilləri silinməyə markalayır. `keep` rejimində isə `imagesToDelete` massivindəki şəkilləri silir və yeni şəkilləri artırır. Maximum 5 şəkil məhdudiyyəti tətbiq edildi.
* **`getProductReview` (Paralel Sorğular & Reytinq Analytics)**:
  * `Promise.all` vasitəsilə rəyləri (`populate('userId', 'name email')`), filtrlənmiş ümumi sayı (`countDocuments`) və orta ulduz reytinqini (`$avg`, `$sum`) paralel icra edir.
  * Mongoose `$group` aggregation-ı vasitəsilə 1, 2, 3, 4, 5 ulduz verilən rəylərin sayı (`ratingDistribution`) hesablanır.
* **`deleteReview`**: Rəyi silərkən onun Cloudinary-də olan bütün şəkillərini də təmizləyir.

### 1.2. Review API Controller Və İcazələr (`libs/review/src/lib/review.controller.ts`)
* **`FileFieldsInterceptor`**: `POST /api/review/:id` və `PUT /api/review/:id` marşrutlarına `FileFieldsInterceptor([{ name: 'images', maxCount: 5 }])` tətbiq edildi (`multipart/form-data` şəkil fayllarını tutmaq üçün).
* **Təhlükəsizlik Guard-ları**: Rəy yaratmaq və yeniləmək `@Auth()`, rəy silmək `@Auth(UserRole.ADMIN)`, rəyləri oxumaq isə `@Public()` kimi qorundu.

### 1.3. Review Modulu Və TypeScript Path Alias Konfiqurasiyası
* **`ReviewModule`**: `MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }])` ilə Mongoose modeli modula bağlandı.
* **`tsconfig.base.json` & `tsconfig.lib.json`**: `@new-poster-parlor-api/review` path alias-ı `tsconfig.base.json`-a əlavə olundu və `libs/review/tsconfig.lib.json` standartlaşdırıldı.

### 1.4. Sənədləşdirmə Və Postman Bələdçiləri
* `libs/review/src/README.md` master oxuma sırası xəritəsi.
* `libs/review/src/lib/` daxilində 3 ədəd ətraflı izahat sənədi (`reviewmodule.md`, `review.controller.md`, `reviewservice.md`).
* `libs/inventory/TestingWithPostman.md` və `libs/review/TestingWithPostman.md` addım-addım Postman sınaq bələdçiləri yaradıldı.

---

## 🎯 2. Müəllimdən Xülasə Qeyd

Rəy və reytinq idarəetməsi sistemi Cloudinary media rollback, Mongoose aggregation analytics, təkrar rəy əngəllənməsi və 100% Postman test ssenariləri ilə peşəkar standartlarda tamamlandı! 🚀

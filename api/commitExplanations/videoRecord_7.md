# 🎥 Video Record #7 — Inventory Management, Cloudinary Media Storage & Advanced Mongoose Filtering

Bu sənəd **Video #7** çərçivəsində `new-poster-parlor-api` monorepo layihəsində həyata keçirilən **Cloudinary Bulud Media İnteqrasiyası, Poster İdarəetməsi (Inventory Service & Controller), Qabaqcıl Mongoose Filtrləməsi və Səhifələmənin (Pagination)** tam izahıdır.

---

## 📌 1. Nələr Edildi? (Əsas Dəyişikliklər Və Əlavələr)

### 1.1. Cloudinary Bulud Media Servisi (`libs/inventory/src/lib/cloudinary.service.ts`)
* **`CloudinaryService`**: `.env` faylındakı `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` və `CLOUDINARY_API_SECRET` məlumatları ilə Cloudinary SDK-sı inicializasiya olundu.
* **`uploadImage` & `uploadMultipleImages`**: Node.js `Readable` Stream-ləri vasitəsilə yaddaşdakı fayl Buffer-lərini Cloudinary `upload_stream`-inə ötürərək şəkilləri bulud serverə yükləyir.
* **`deleteImage` & `deleteMultipleImages`**: Şəkillərin unikal `public_id`-si ilə Cloudinary-dən paralel silinməsini təmin edir.

### 1.2. Məhsul Biznes Loqikası (`libs/inventory/src/lib/inventory.service.ts`)
* **`addInventoryItem`**: Şəkilləri Cloudinary-yə yükləyir, `Poster` sənədini MongoDB-də saxlayır. Əgər baza əməliyyatında xəta baş verərsə, yüklənmiş şəkilləri Cloudinary-dən avtomatik silir (Rollback).
* **`getAllInventoryItem`**: Qiymət aralığı (`minPrice`/`maxPrice`), Stok, Kateqoriya, Tag-lər, Ölçülər, Material və Canlı Axtarış üzrə qabaqcıl Mongoose filtrləməsi və səhifələmə (`page`, `limit`, `skip`, `countDocuments`) yazıldı.
* **`updateInventoryItem`**: Posterin məlumatlarını güncəlləyərkən Cloudinary-dən köhnə şəkillərin silinməsi (`imagesToDelete`), yeni şəkillərin əlavə olunması və ya tam əvəzlənməsi (`imageAction === 'replace'`) loqikası yazıldı.
* **`deleteInventoryItem` & `softDeleteInventoryItem`**: Posteri tam silərkən (Hard Delete) onun Cloudinary-dəki bütün şəkillərini də paralel olaraq bulud serverdən təmizləyir. Soft Delete rejimində isə `isAvailable: false` edir.
* **`getFilters`**: Mongoose `aggregate` (`$group`) və `distinct` əməliyyatları ilə frontend filtr menyusu üçün kateqoriya statistikalarını, materialları və ölçüləri qaytarır.

### 1.3. Inventory API Controller Və Fayl Interceptor-ları (`libs/inventory/src/lib/inventory.controller.ts`)
* **`FileFieldsInterceptor`**: Express-dən gələn `multipart/form-data` şəkil fayllarını qəbul etmək üçün interceptor tətbiq edildi.
* **Marşrut İcazələri**: İctimai marşrutlar `@Public()`, poster yeniləmə və silmə marşrutları isə `@Auth(UserRole.ADMIN)` ilə qorundu.

### 1.4. `InventoryModule` Və Sənədləşdirmə
* `MongooseModule.forFeature([{ name: Poster.name, schema: PosterSchema }])` ilə Mongoose modeli `InventoryModule`-a bağlandı.
* `libs/inventory/src/README.md` oxuma sırası xəritəsi və 4 ədəd ətraflı `.md` sənəd faylı (`cloudinary.md`, `inventoryservice.md`, `inventory.controller.md`, `inventorymodule.md`) yaradıldı.

---

## 🎯 2. Müəllimdən Xülasə Qeyd

Məhsul və şəkil idarəetməsi sistemi Cloudinary bulud servisi və MongoDB Aggregation & Filtering vasitəsilə 100% tam, xətasız və peşəkar şəkildə quruldu! 🚀

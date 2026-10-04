# 📦 Inventory Library Master Learning Guide (Oxuma Sırası)

Əziz tələbə! 👋 `libs/inventory` (Məhsul / Poster İdarəetməsi) modulunu tam anlayıb mütəxəssis kimi qavramağın üçün aşağıdakı **MÜTƏLƏƏ SIRASI** ilə oxumalısan:

---

## 🗺️ Oxunma Sırası Xəritəsi (Roadmap)

```
 ┌────────────────────────────────────────────────────────┐
 │ 1️⃣  README.md (Sən buradasan - İdarəetmə Xəritəsi)     │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2️⃣  lib/cloudinary.md (Bulud Media Servisi)           │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3️⃣  lib/inventoryservice.md (Əsas Biznes Loqikası)     │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4️⃣  lib/inventory.controller.md (API Route-lar)        │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 5️⃣  lib/inventorymodule.md (NestJS Modul Bağlantıları)  │
 └────────────────────────────────────────────────────────┘
```

---

## 📚 Sənədlərin Xülasəsi:

### 1️⃣ [lib/cloudinary.md](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/inventory/src/lib/cloudinary.md)
* **Mövzu**: `CloudinaryService` — Şəkillərin bulud serverə yüklənməsi və silinməsi.
* **Status**: ✅ **Yaradıldı və Kodlar İzah Olundu!** (İndi buradan oxumağa başlaya bilərsən).

### 2️⃣ `lib/inventoryservice.md` *(Növbəti addım)*
* **Mövzu**: `InventoryService` — Poster əlavə etmək, Mongoose filtrləmələri (Qiymət, Kateqoriya, Haşiyə, Tag-lər), Poster yeniləmək və silmək.

### 3️⃣ `lib/inventory.controller.md` *(Növbəti addım)*
* **Mövzu**: `InventoryController` — Multipart form-data fayl qəbulu, FileFieldsInterceptor və Public/Admin icazələri.

### 4️⃣ `lib/inventorymodule.md` *(Növbəti addım)*
* **Mövzu**: `InventoryModule` — Komponentlərin NestJS DI konteynerində birləşməsi.

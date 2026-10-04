# 🌐 InventoryController Master Guide (`inventory.controller.md`)

Bu sənəd `libs/inventory/src/lib/inventory.controller.ts` faylındakı `InventoryController` klasının, onun marşrutlarının (routes), fayl yükləmə mexanizminin (`FileFieldsInterceptor`) və təhlükəsizlik icazələrinin (`@Public()`, `@Auth(UserRole.ADMIN)`) izahıdır.

---

## 🧭 Ümumi Controller Məqsədi

`InventoryController` məhsul və posterlərin idarə olunması üçün HTTP API giriş qapısıdır (`/api/inventory`).
Əsas vəzifəsi:
- Client-dən (Frontend və ya Postman) gələn `multipart/form-data` şəkil fayllarını qəbul etmək.
- Səhifələmə (Pagination) və Filtrləmə Query parametrini oxuyub `InventoryService`-ə ötürmək.
- Təhlükəsizliyi təmin etmək: Hamı üçün açıq olan endpoint-ləri `@Public()`, adminlər üçün olanları isə `@Auth(UserRole.ADMIN)` ilə qorumaq.

---

## 📌 Route-ların Ətraflı İzahı

---

### 1️⃣ `POST /api/inventory`
* **İcazə**: `@Public()` *(Test üçün)*
* **Dekoratorlar**: `@UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))`
* **Məqsəd**: Yeni poster əlavə etmək.
* **İş Prinsipi**:
  1. `multipart/form-data` formatında gələn maks 5 şəkil faylını `files.images` sahəsindən tutur.
  2. `itemDetails` body obyektini (`title`, `price`, `description`, `stock`, `category`) oxuyur.
  3. `inventoryService.addInventoryItem(images, itemDetails)` çağıraraq yeni poster yaradır.

---

### 2️⃣ `GET /api/inventory`
* **İcazə**: `@Public()`
* **Məqsəd**: Kataloqda posterləri filtrləmək və səhifələrlə (Pagination) gətirmək.
* **Query Parametrləri**: `page`, `limit`, `minPrice`, `maxPrice`, `category`, `tags`, `search`, `sortBy`, `sortOrder`.
* **İş Prinsipi**: Query parametrlərini `PosterFilter` obyektinə çevirib `inventoryService.getAllInventoryItem()` çağırır.

---

### 3️⃣ `GET /api/inventory/categories/list`
* **İcazə**: `@Public()`
* **Məqsəd**: Sol filtr menyusunu dinamik doldurmaq üçün kateqoriyaları və məhsul sayı statistikalarını almaq.

---

### 4️⃣ `GET /api/inventory/search?q=space`
* **İcazə**: `@Public()`
* **Məqsəd**: Live axtarış input-u üçün posterlərdə sürətli axtarış aparmaq.

---

### 5️⃣ `PUT /api/inventory/:id`
* **İcazə**: `@Auth(UserRole.ADMIN)` *(Yalnız Admin)*
* **Dekoratorlar**: `@UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))`
* **Məqsəd**: Mövcud posterin məlumatlarını və şəkillərini yeniləmək.

---

### 6️⃣ `DELETE /api/inventory/:id` və `DELETE /api/inventory/:id/hard`
* **İcazə**: `@Auth(UserRole.ADMIN)` *(Yalnız Admin)*
* **Silmə Növləri**:
  * `DELETE /:id` ➡️ **Soft Delete**: Posteri bazadan silmir, sadəcə `isAvailable: false` edir.
  * `DELETE /:id/hard` ➡️ **Hard Delete**: Posteri bazadan VƏ onun bütün şəkillərini Cloudinary-dən tam silir.

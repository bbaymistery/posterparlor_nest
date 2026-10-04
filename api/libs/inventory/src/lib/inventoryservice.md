# 📦 InventoryService Master Guide (`inventoryservice.md`)

Bu sənəd `libs/inventory/src/lib/inventory.service.ts` faylındakı `InventoryService` klasının və onun daxilindəki bütün biznes loqikalarının ən xırda detalına qədər izahıdır.

---

## 🏛️ Ümumi Məqsəd

`InventoryService` bizim e-ticarət (Poster Parlor) tətbiqimizin **Məhsul Katalogu və Stok İdarəetmə** mərkəzidir.
Bu servis aşağıdakı əsas işləri görür:
1. **Poster Yaradılması**: Şəkillərin Cloudinary-yə yüklənməsi və poster sənədinin MongoDB bazasında yaradılması.
2. **Qabaqcıl Filtrləmə & Səhifələmə (Pagination)**: Qiymət aralığı (`minPrice`, `maxPrice`), Stok, Kateqoriya, Ölçü, Material, Tag-lər və Axtarış üzrə süzmə.
3. **Şəkil İdarəli Yenilənmə**: Posterin məlumatlarını güncəlləyərkən Cloudinary-dən köhnə şəkillərin silinməsi və yenilərin əlavə olunması.
4. **Təhlükəsiz Silmə (Hard/Soft Delete)**: Posteri tam silərkən onun Cloudinary-dəki bütün şəkillərini də paralel olaraq bulud serverdən təmizləmək.

---

## 🧩 Funksiyaların Ətraflı İzahı

---

### 1️⃣ `addInventoryItem(images, itemDetails)`
* **Nə iş görür?**: Yeni poster yaradır və bazaya yazır.
* **İş Prinsipi**:
  1. Qiymətin və stokun mənfi olub-olmadığını, ən azı 1 şəklin gəldiyini yoxlayır.
  2. `cloudinaryService.uploadMultipleImages(images)` vasitəsilə şəkilləri Cloudinary-yə yükləyir.
  3. Qayıdan `secure_url` və `public_id`-ləri götürüb MongoDB-də `Poster` sənədi yaradır.
  4. **⚠️ Xəta baş verərsə (Rollback)**: Əgər baza əməliyyatında xəta baş verərsə, buludda yetim şəkil qalmamaq üçün yüklənmiş şəkilləri Cloudinary-dən silir!

#### 🍃 MongoDB-yə Necə Ulaşırıq Və Sənədi Necə Yazırıq? (3 Addımda İzah)

1. **Konstruktorda MongoDB Modelinin İnyeksiyası (Inject)**:
   ```typescript
   constructor(
     private readonly cloudinaryService: CloudinaryService,
     @InjectModel(Poster.name) private readonly posterModel: Model<PosterDocument>
   ) { }
   ```
   * `@InjectModel(Poster.name)` vasitəsilə NestJS MongoDB-dəki `posters` kolleksiyasını idarə edən `this.posterModel` obyektini servisə ötürür.

2. **Mongoose Sənədinin Yaradılması (`new this.posterModel(...)`)**:
   ```typescript
   const newInventoryItem = {
     ...itemDetails,
     images: imageUploadResults,
   };
   const createdInventoryItem = new this.posterModel(newInventoryItem);
   ```
   * Şəkillər Cloudinary-dən gəldikdən sonra DTO məlumatları ilə birləşdirilir və `PosterSchema` qaydalarına görə doğrulanan Mongoose sənədi yaradılır.

3. **MongoDB Bazasına Fiziki Yazılma (`await createdInventoryItem.save()`)**:
   ```typescript
   return await createdInventoryItem.save();
   ```
   * `save()` metodu Mongoose vasitəsilə `.env`-dəki `DB_URL` üzərindən MongoDB Atlas-a fiziki `INSERT` sorğusu atır, sənədə avtomatik `_id` verib yeni posteri qaytarır!

```
[ Frontend-dən gələn DTO və Şəkillər ]
                │
                ▼
[ newInventoryItem obyekti düzəldilir ]
                │
                ▼
[ new this.posterModel(newInventoryItem) ]  <-- Mongoose Schema yoxlanışı
                │
                ▼
[ await createdInventoryItem.save() ]       <-- MongoDB Atlas-a fiziki yazılır (INSERT)
                │
                ▼
[ Bazada yaradılmış yeni Poster sənədi (qaytarılır) ]
```

---

### 2️⃣ `getAllInventoryItem(page, limit, filters)`
* **Nə iş görür?**: Məhsul kataloqunda posterləri filtrlərlə və səhifələrlə qaytarır.
* **İş Prinsipi**:
  1. `buildQuery(filters)` köməkçi metodu vasitəsilə MongoDB sorğusunu (Regex və `$gte`/`$lte`) qurur.
  2. `skip = (page - 1) * limit` düsturu ilə səhifələməni hesablayır.
  3. `Promise.all([ find(query), countDocuments(query) ])` vasitəsilə paralel olaraq həm posterləri, həm də ümumi poster sayını gətirir.

---

### 3️⃣ `updateInventoryItem(id, newImages, updateDetails)`
* **Nə iş görür?**: Posteri güncəlləyir.
* **İş Prinsipi**:
  1. Silinməsi tələb olunan köhnə şəkilləri Cloudinary-dən silir (`imagesToDelete`).
  2. Yeni şəkillər gəliblərsə Cloudinary-yə yükləyir (`newImages`).
  3. Əgər `imageAction === 'replace'` olarsa, köhnə şəkillərin hamısını buluddan təmizləyib yeniləri ilə əvəzləyir.
  4. MongoDB-də `findByIdAndUpdate` çağırır.

---

### 4️⃣ `getFilters()`
* **Nə iş görür?**: Frontend-də sol filtr menyusunu dinamik doldurmaq üçün mövcud olan bütün kateqoriyaları (hərəsində neçə məhsul olduğu ilə birgə), materialları və ölçüləri qaytarır.
* **İş Prinsipi**: MongoDB-nin `aggregate` (Group By) və `distinct` əməliyyatlarından istifadə edir.

---

### 5️⃣ `deleteInventoryItem(id)`
* **Nə iş görür?**: Posteri bazadan tam silir (Hard Delete).
* **İş Prinsipi**:
  1. Posterin MongoDB-dəki `images` massivindən bütün `public_id`-ləri çıxarır.
  2. `cloudinaryService.deleteMultipleImages(publicIds)` ilə bütün şəkilləri Cloudinary-dən silir.
  3. Sonra posteri MongoDB-dən təmizləyir.

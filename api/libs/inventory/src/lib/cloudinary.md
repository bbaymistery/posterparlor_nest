# ☁️ CloudinaryService Master Guide (`cloudinary.md`)

Bu sənəd `libs/inventory/src/lib/cloudinary.service.ts` faylındakı `CloudinaryService` klasının və onun daxilindəki hər bir metodu ən xırda detalına qədər izah edir.

---

## 🏛️ Ümumi Arxitektura Və Məqsəd

Verilənlər Bazasında (MongoDB) böyük şəkil fayllarını (meqabaytlarla) birbaşa saxlanmaq **yaxşı təcrübə sayılmır**. 
Bunun əvəzinə:
1. Şəkillər **Cloudinary** adlı xüsusi bulud (cloud) media serverinə yüklənir.
2. Cloudinary şəkil üçün **`secure_url`** (məsələn: `https://res.cloudinary.com/.../poster.jpg`) və **`public_id`** (məsələn: `Posters/abc123xyz`) qaytarır.
3. Biz MongoDB-də yalnız həmin `url` və `public_id`-ni saxlayırıq.

---

## 🛠️ İnjection və Konstruktor (Constructor)

```typescript
constructor(private cloudConfig: AppConfigService) {
  cloudinary.config({
    cloud_name: this.cloudConfig.cloudinaryConfig.cloudinaryName,
    api_key: this.cloudConfig.cloudinaryConfig.cloudinaryApiKey,
    api_secret: this.cloudConfig.cloudinaryConfig.cloudinaryApiSecret,
  });
}
```
* **`cloudConfig`**: `.env` faylından `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` və `CLOUDINARY_API_SECRET` parametrlərini oxuyur və Cloudinary SDK-sını işə salır.

---

## 🧩 Funksiyaların Ətraflı İzahı

---

### 1️⃣ `uploadImage(file: FileStructure)`
* **Nə iş görür?**: Brauzerdən və ya Postman-dan gələn tək bir şəkil faylını Cloudinary-dəki `Posters` qovluğuna yükləyir.
* **Necə işləyir?**:
  1. `bufferToReadable(file.buffer)` vasitəsilə faylın RAM-dakı ikilik məlumatını Node.js Stream-inə (Axınına) çevirir.
  2. `cloudinary.uploader.upload_stream` vasitəsilə axını Cloudinary serverinə ötürür.
  3. Yüklənmə uğurlu olarsa `UploadApiResponse` (şəklin keçidi `secure_url` və `public_id`) qaytarır.

---

### 2️⃣ `uploadMultipleImages(files: FileStructure[])`
* **Nə iş görür?**: Posterin 3-4 şəkli olduqda onları eyni anda paralel olaraq Cloudinary-yə yükləyir.
* **Necə işləyir?**:
  1. Massivdəki hər bir fayl üçün `uploadImage(file)` metodunu çağırır (`uploadPromises`).
  2. `Promise.all(uploadPromises)` vasitəsilə bütün şəkillərin paralel yüklənməsini təmin edir (sürətli işləmək üçün).
* **Qayıdan Dəyər**: Şəkil cavablarının massivi (`UploadApiResponse[]`).

---

### 3️⃣ `deleteImage(publicId: string)`
* **Nə iş görür?**: Bir poster silindikdə və ya şəkli dəyişdirildikdə köhnə şəkli Cloudinary-dən silir.
* **Necə işləyir?**:
  1. `cloudinary.uploader.destroy(publicId)` çağırır.
  2. `publicId` (məsələn: `Posters/abc123xyz`) vasitəsilə həmin şəkli bulud serverdən təmizləyir.

---

### 4️⃣ `deleteMultipleImages(publicIds: string[])`
* **Nə iş görür?**: Birdən çox silinəcək şəkil ID-si verildikdə onları paralel olaraq silir.
* **Necə işləyir?**:
  1. `publicIds.map(id => this.deleteImage(id))` ilə silmə sorğularını hazırlayır.
  2. `Promise.all()` ilə hamısını paralel təmizləyir.

---

### 🛠️ Köməkçi Metod: `bufferToReadable(buffer: Buffer)`
* Node.js yaddaşındakı (RAM) bütöv fayl Buffer-ini tikə-tikə ötürülən `Readable Stream`-ə çevirir. Cloudinary-nin `upload_stream` metodu faylları Stream şəklində qəbul etdiyi üçün bu çevrilmə mütləqdir.

---

## 🔄 Şəkil Yükləmə Axını Diagramı

```
[ Frontend / Client ]
        │
        │ 1. Multipart Form-Data (Fayl Buffer-i)
        ▼
[ InventoryController / Service ]
        │
        │ 2. uploadImage(file)
        ▼
[ CloudinaryService ]
        │
        │ 3. bufferToReadable(file.buffer) ---> Stream-ə çevrilir
        │ 4. upload_stream({ folder: 'Posters' })
        ▼
[ Cloudinary Server ]
        │
        │ 5. Yüklənir və Secure URL qaytarır: https://res.cloudinary.com/.../image.jpg
        ▼
[ MongoDB Database ]  <--- Yalnız url və public_id saxlanılır!
```

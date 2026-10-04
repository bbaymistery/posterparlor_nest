# 🧪 Postman ilə Inventory (Məhsul İdarəetməsi) API-lərini Test Etmək Bələdçisi

Bu sənəd **Inventory API-lərini (Məhsul yaradılması, Cloudinary şəkil yükləməsi, Mongoose filtrləri, Yeniləmə və Silmə)** Postman-da addım-addım necə test edəcəyinizi 100% dəqiq sahələrlə izah edir.

---

## 🔑 1. Təhlükəsizlik Və Auth Qaydası
Inventory API-lərində məhsul əlavə etmək, yeniləmək və silmək yalnız **`ADMIN`** roluna malik istifadəçilər üçündür (`@Auth(UserRole.ADMIN)`).

* **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>` (və ya Postman-da `Auth -> Bearer Token` bölməsinə yapışdırın).
* **Və ya Cookie**: Postman-da `Login` etmisinizsə cookie avtomatik ötürüləcək.

---

## 🚀 2. Postman-da Addım-Addım Test Ssenariləri

Əsas URL: **`http://localhost:3000/api/inventory`**

---

### 🟢 TEST 1: Yeni Məhsul Əlavə Etmək (`POST /api/inventory`)
* **Method**: `POST`
* **URL**: `http://localhost:3000/api/inventory`
* **Auth**: `@Auth(UserRole.ADMIN)` (Admin tokeni lazımdır)
* **Body Tip**: **`form-data`** ⚠️ *(JSON deyil! Çünki şəkil faylları göndəririk)*
* **Form-data Parameterləri (MƏCBURİ SAHƏLƏR)**:

| Key (Açar) | Type | Value (Dəqiq Dəyər) | Izah / Tələb |
| :--- | :--- | :--- | :--- |
| `title` | Text | `Cyberpunk Neon Poster` | Məhsulun adı (Məcburi) |
| `description` | Text | `Stunning neon style poster` | Təsviri (Optional) |
| `price` | Text | `29.99` | Qiymət (Məcburi number) |
| `dimensions` | Text | `50x70 cm` | Ölçü / Ölçülər (Məcburi string, `size` YOX!) |
| `material` | Text | `Canvas` | Material (Optional) |
| `isAvailable` | Text | `true` | Satışda var? (`true` / `false` Məcburi boolean) |
| `tags` | Text | `["neon", "cyberpunk"]` | Etiketlər (Məcburi array/json) |
| `stock` | Text | `50` | Stok sayı (Məcburi number) |
| `category` | Text | `Sci-Fi` | Kateqoriya (Məcburi) |
| `images` | **File** | *(Kompüterinizdən 1 və ya bir neçə şəkil seçin)* | 📸 Cloudinary-yə yüklənəcək |

* **Cavab (201 Created)**:
  ```json
  {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "title": "Cyberpunk Neon Poster",
    "price": 29.99,
    "dimensions": "50x70 cm",
    "isAvailable": true,
    "images": [
      {
        "url": "https://res.cloudinary.com/.../image.jpg",
        "public_id": "poster_parlor/inventory/..."
      }
    ]
  }
  ```

---

### 🔓 TEST 2: Qabaqcıl Filtrləmə Və Səhifələmə (`GET /api/inventory`)
* **Method**: `GET`
* **URL**: `http://localhost:3000/api/inventory?page=1&limit=10&category=Sci-Fi&minPrice=10&maxPrice=50&search=neon`
* **Auth**: 🔓 `@Public()` (Hər kəs üçün açıqdır)

---

### 📊 TEST 3: Filtr Menyusu Statistiki Məlumatları (`GET /api/inventory/categories/list`)
* **Method**: `GET`
* **URL**: `http://localhost:3000/api/inventory/categories/list`
* **Auth**: 🔓 `@Public()`

---

### 🔍 TEST 4: Tək Məhsul Məlumatını Almaq (`GET /api/inventory/:id`)
* **Method**: `GET`
* **URL**: `http://localhost:3000/api/inventory/673f1a2b3c4d5e6f7a8b9c0d`
* **Auth**: 🔓 `@Public()`

---

### ✏️ TEST 5: Məhsul Güncəlləməsi Və Şəkil Rejimləri (`PUT /api/inventory/:id`)
* **Method**: `PUT`
* **URL**: `http://localhost:3000/api/inventory/673f1a2b3c4d5e6f7a8b9c0d`
* **Auth**: `@Auth(UserRole.ADMIN)`
* **Body Tip**: **`form-data`**
* **Form-data Parameterləri**:
  * `price`: `34.99`
  * `isAvailable`: `true`
  * `images`: *(Yeni şəkil faylı seçin)*
  * `imageAction`: `add` *(və ya `replace`)*

---

### 🗑️ TEST 6: Məhsulu Silmək (`DELETE /api/inventory/:id`)
* **Method**: `DELETE`
* **URL**: `http://localhost:3000/api/inventory/673f1a2b3c4d5e6f7a8b9c0d`
* **Auth**: `@Auth(UserRole.ADMIN)`

# 🧪 Postman ilə Review (Rəy & Ulduz) API-lərini Test Etmək Bələdçisi

Bu sənəd **Review API-lərini (Rəy yazmaq, Ulduz balı vermək, Şəkil yükləmək, Statistika və Silmə)** Postman-da addım-addım necə test edəcəyinizi izah edir.

---

## 🔑 1. Təhlükəsizlik Və Auth Qaydası
* **Rəy Yazmaq Və Yeniləmək**: İstənilən daxil olmuş istifadəçi üçündür (`@Auth()`).
* **Rəy Silmək**: Yalnız **`ADMIN`** roluna malik istifadəçi və ya rəyin sahibi üçündür (`@Auth(UserRole.ADMIN)`).
* **Headers**: `Authorization: Bearer <ACCESS_TOKEN>` (və ya Postman-da `Auth -> Bearer Token` bölməsinə yapışdırın).

---

## 🚀 2. Postman-da Addım-Addım Test Ssenariləri

Əsas URL: **`http://localhost:3000/api/review`**

---

### 🟢 TEST 1: Postere Yeni Rəy Yaratmaq (`POST /api/review/:posterId`)
* **Method**: `POST`
* **URL**: `http://localhost:3000/api/review/673f1a2b3c4d5e6f7a8b9c0d` *(Bu `:posterId` yuxarıda yaradılmış Poster ID-sidir)*
* **Auth**: 🔐 `@Auth()` (Giriş etmiş istifadəçi tokeni)
* **Body Tip**: **`form-data`** ⚠️ *(Şəkil yükləmək üçün `form-data` seçilir)*

💡 **💡 Mühüm Məntiq (Poster Şəkli vs Rəy Şəkli)**:
* 🖼️ **Poster-in Şəkilləri (`posters` kolleksiyası)**: Admin tərəfindən məhsul yaradılarkən yüklənən rəsmi məhsul fotosudur.
* 📸 **Rəy-in Şəkilləri (`reviews` kolleksiyası)**: Müştərinin (İstifadəçinin) evində posteri divara asıb telefonla çəkdiyi fotosudur! *(Məsələn: Müştəri posteri aldı, divarından asdı, fotosunu çəkdi və rəy bölməsinə yapışdırdı)*.
* ⚠️ **Qeyd**: `images` sahəsi məcburi deyil (isteğə bağlıdır / optional). Şəkil seçməsəniz də rəy yaradılacaq.

* **Form-data Parameterləri**:

| Key (Açar) | Type | Value (Nümunə Dəyər) | Izah |
| :--- | :--- | :--- | :--- |
| `rating` | Text | `5` | 1-dən 5-dək ulduz balı (Məcburi) |
| `comment` | Text | `Mohtesem keyfiyyetli posterdir, cox bəyəndim!` | Rəy mətni |
| `images` | **File** | *(Kompüterdən max 5 şəkil seçin)* | 📸 Cloudinary-yə yüklənəcək rəy şəkilləri (Optional) |

* **Cavab (201 Created)**:
  ```json
  {
    "_id": "673f99993c4d5e6f7a8b9999",
    "posterId": "673f1a2b3c4d5e6f7a8b9c0d",
    "userId": "673a11112222333344445555",
    "rating": 5,
    "comment": "Mohtesem keyfiyyetli posterdir, cox bəyəndim!",
    "images": [
      {
        "url": "https://res.cloudinary.com/.../review_image.jpg",
        "public_id": "poster_parlor/reviews/..."
      }
    ]
  }
  ```
* ⚠️ **Mühüm Qayda**: Əgər eyni istifadəçi ilə eyni posterə 2-ci dəfə rəy yazmağa çalışsanız, API **`409 Conflict: You have already reviewed this poster`** xətası verəcək!

---

### 🔓 TEST 2: Posterin Rəylərini Və Statistikasını Almaq (`GET /api/review/:posterId`)
* **Method**: `GET`
* **URL**: `http://localhost:3000/api/review/673f1a2b3c4d5e6f7a8b9c0d?page=1&limit=10&sort=newest&rating=5&hasImage=true`
* **Auth**: 🔓 `@Public()` (Hər kəs üçün açıqdır)
* **Params**:
  * `page`: `1`
  * `limit`: `10`
  * `sort`: `newest` *(digərləri: `oldest`, `highest`, `lowest`)*
  * `rating`: `5` *(optional: yalnız 5 ulduzlu rəyləri gətir)*
  * `hasImage`: `true` *(optional: yalnız şəkilli rəyləri gətir)*
* **Cavab (200 OK)**:
  ```json
  {
    "reviews": [
      {
        "_id": "673f99993c4d5e6f7a8b9999",
        "rating": 5,
        "comment": "Mohtesem keyfiyyetli posterdir...",
        "userId": {
          "_id": "673a11112222333344445555",
          "name": "Elgun Ezmermedov",
          "email": "elgun@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalReviews": 1,
      "limit": 10
    },
    "stats": {
      "averageRating": 5,
      "totalReviews": 1,
      "ratingDistribution": {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 1
      }
    }
  }
  ```

---

### ✏️ TEST 3: Rəyi Yeniləmək (`PUT /api/review/:reviewId`)
* **Method**: `PUT`
* **URL**: `http://localhost:3000/api/review/673f99993c4d5e6f7a8b9999` *(Bu `:reviewId` rəyin id-sidir)*
* **Auth**: 🔐 `@Auth()` (Yalnız rəyin yazar sahibi və ya Admin)
* **Body Tip**: **`form-data`**
* **Form-data Parameterləri**:
  * `rating`: `4`
  * `comment`: `Yenilənmiş rəy mətni...`
  * `images`: *(Yeni şəkillər)*
  * `imageAction`: `keep` *(və ya `replace`)*

---

### 🗑️ TEST 4: Rəyi Silmək (`DELETE /api/review/:reviewId`)
* **Method**: `DELETE`
* **URL**: `http://localhost:3000/api/review/673f99993c4d5e6f7a8b9999`
* **Auth**: 🔐 `@Auth(UserRole.ADMIN)`
* **Cavab (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "message": "Review deleted Successfully"
  }
  ```

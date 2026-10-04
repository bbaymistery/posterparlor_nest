# 🧪 Postman ilə Auth API-lərini Test Etmək Və `idToken` Almaq Bələdçisi (`TestingWithPostman.md`)

Bu sənəd Google OAuth2 girişini Postman-da test etmək üçün **`idToken`-in haradan və necə alınacağını** və **5 əsas test ssenarisini** addım-addım izah edir.

---

## 🔑 1. Google `idToken`-i Haradan Və Necə Almaq Olar?

Backend-də `loginWithGoogle` funksiyası Google tərəfindən imzalanmış real bir `idToken` və sizin proyektinizin `GOOGLE_CLIENT_ID`-sini gözləyir.

### 🌟 🟢 100% Tam İşləyən Metod (Google Cloud Console + OAuth Playground)

#### 1️⃣ Addım: Google Cloud Console-a Yönləndirmə Linki Əlavə Etmək (Tək dəfəlik)
1. Brauzerdə **[Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)** səhifəsinə girin.
2. Öz Client ID-nizə (`713469299798...`) klikləyin.
3. **Authorized redirect URIs** (Səlahiyyətli Yönləndirmə URI-ləri) daxilinə bu linki əlavə edin:
   `https://developers.google.com/oauthplayground`
4. **Save (Yadda saxla)** düyməsinə basın.

---

#### 2️⃣ Addım: Google OAuth Playground-dan Token Almaq
1. Brauzerdə **[Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)** saytını açın.
2. Sağ yuxarı küncdəki **Açarlar (⚙️ Configuration Icon)** düyməsinə basın:
   - ✅ **`Use your own OAuth credentials`** qutusunu işarələyin (check edin).
   - **`OAuth Client ID`**: `.env` faylınızdakı `GOOGLE_CLIENT_ID`-ni yapışdırın:
     `713469299798-6kacreihtfm7uaoujnv7havj1mbalftb.apps.googleusercontent.com`
   - **`OAuth Client Secret`**: `.env` faylınızdakı `GOOGLE_CLIENT_SECRET`-i yapışdırın:
     `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`
   - Pəncərəni bağlayın.
3. Sol tərəfdəki **Step 1 (Select & authorize APIs)** hissəsindən:
   - Sol aşağıdakı **`Input your own scopes`** xanasına birbaşa bunu yazın (və ya yapışdırın):
     `email profile openid`
4. Göy **`Authorize APIs`** düyməsinə basın və Google hesabınızla daxil olun.
5. Otomatik olaraq **Step 2 (Exchange authorization code for tokens)** pəncərəsinə yönləndiriləcəksiniz:
   - Sol tarafdakı göy **`Exchange authorization code for tokens`** düyməsinə basın.
6. Sağ tərəfdə JSON cavabı çıxacaq. Cavabın içində **`id_token`** sahəsini tapacaqsınız (`eyJhbGciOiJSUzI1Ni...` ilə başlayır).
7. Məhz həmin **`id_token`** uzun simvollar zəncirini kopyalayın! Məhz bu bizim Postman-da göndərəcəyimiz koddur.

---

### 🌐 Metod B: Frontend Tərəfindən (React / Vue / JS)
Frontend tətbiqində `@react-oauth/google` və ya Google `gsi/client` istifadə etdikdə Google login düyməsinə basıldıqda alınan `credential` dəyəri məhz bu `idToken`-dir.

---

## 🚀 2. Postman-da Addım-Addım Test Ssenariləri

Serverinizin işlədiyindən əmin olun (`npm run dev` və ya `npx nx serve api`).
Əsas URL: **`http://localhost:3000/api`**

---

### 🟢 TEST 1: Public Route Testi (`GET /api`)

- **Method**: `GET`
- **URL**: `http://localhost:3000/api`
- **Məqsəd**: `@Public()` dekoratorunun işlədiyini yoxlayır.
- **Cavab (200 OK)**:
  ```json
  {
    "message": "Hello API"
  }
  ```

---

### 🔑 TEST 2: Google Login (`POST /api/auth/google/login`)

- **Method**: `POST`
- **URL**: `http://localhost:3000/api/auth/google/login`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body** (`raw` -> `JSON`):
  ```json
  {
    "idToken": "YUXARIDA_GOOGLE_PLAYGROUND-DAN_KOPYALADIĞINIZ_ID_TOKEN"
  }
  ```
- **Cavab (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Request successful",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1Ni...",
      "user": {
        "id": "6ab4cd622770b109eba023c1",
        "email": "elgun.ezmermedov@gmail.com",
        "name": "Elgun Ezmermedov",
        "role": "USER"
      }
    }
  }
  ```
- 💡 **MÜHÜM**: Cavab gələndə Postman avtomatik olaraq `access_token` və `refresh_token`-i **Cookies** bölməsinə yaddaşa yazacaq.

---

### 👤 TEST 3: Qorunan Profil Məlumatını Almaq (`GET /api/auth/google/me`)

- **Method**: `GET`
- **URL**: `http://localhost:3000/api/auth/google/me`
- **Headers / Auth**:
  - **Üsul 1 (Cookie)**: Əgər yuxarıda `Login` etmisinizsə, Postman Cookie-ni avtomatik göndərəcək. Birbaşa **Send** basın.
  - **Üsul 2 (Bearer Token)**: Postman-da `Authorization` tabına keçin -> `Type: Bearer Token` seçin -> `accessToken`-i yapışdırın.
- **Cavab (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "6ab4cd622770b109eba023c1",
      "email": "elgun.ezmermedov@gmail.com",
      "name": "Elgun Ezmermedov",
      "role": "USER"
    }
  }
  ```

---

### 🔄 TEST 4: Access Token-i Yeniləmək (`POST /api/auth/google/refresh`)

- **Method**: `POST`
- **URL**: `http://localhost:3000/api/auth/google/refresh`
- **İş Prinsipi**: Postman `refresh_token` cookie-sini avtomatik göndərir.
- **Cavab (200 OK)**:
  ```json
  {
    "accessToken": "yeni_yaradılmıs_access_token_..."
  }
  ```

---

### 🚪 TEST 5: Çıxış Etmək (`POST /api/auth/google/logout`)

- **Method**: `POST`
- **URL**: `http://localhost:3000/api/auth/google/logout`
- **Cavab (200 OK)**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```
- 🧹 Brauzer/Postman `access_token` və `refresh_token` cookie-ləri silinəcək.

---

## 💡 Postman İpucları Və Xətaların İzahı

* **`401 Unauthorized`**: Token göndərilməyib, tokenin vaxtı bitib və ya `idToken` saxtadır.
* **`403 Forbidden`**: İstifadəçi sistemə daxil olub, lakin o səhifəyə girmək üçün rolu çatmır (məsələn: `user` rolundadır amma `admin` səhifəsinə girir).
* **`500 Internal Server Error`**: `.env` faylında `JWT_ACCESS_TOKEN_SECRET` və ya `GOOGLE_CLIENT_ID` səhvdir/çatışmır.

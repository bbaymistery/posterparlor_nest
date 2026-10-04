# 🎥 Video Record #6 — Authentication System, Google OAuth2, JWT & HttpOnly Cookie Security

Bu sənəd **Video #6** çərçivəsində `new-poster-parlor-api` monorepo layihəsində həyata keçirilən **Google OAuth2 Kimlik Doğrulanması, JWT Access & Refresh Token İstehsalı, HttpOnly Cookie Təhlükəsizliyi, Passport Strategy, Custom Dekoratorlar və Qlobal Guard İnteqrasiyasının** tam izahıdır.

---

## 📌 1. Nələr Edildi? (Əsas Dəyişikliklər Və Əlavələr)

### 1.1. Google OAuth2 İnteqrasiyası (`google-auth-library`)
* **`AuthService.verifyGoogleToken(idToken)`**: Frontend-dən və ya Google OAuth 2.0 Playground-dan gələn `idToken`-in həqiqətən Google tərəfindən verildiyini `OAuth2Client` vasitəsilə təsdiqləyir.
* **Avtomatik İstifadəçi Yaradılması**: Bazada (MongoDB) daxil olan email yoxdursa yeni `User` sənədi yaradılır, varsa `lastLogin` tarixi yenilənir.

### 1.2. JWT Token İstehsalı Və HttpOnly Cookie Təhlükəsizliyi
* **`generateTokens(user)`**: Qısa ömürlü `access_token` (15 dəq) və uzun ömürlü `refresh_token` (7 gün) yaradılır.
* **`setCookies(res, tokens)`**: Zərərli JavaScript kodlarının (XSS hücumlarının) tokenləri oxumasının qarşısını almaq üçün tokenlər brauzerə `HttpOnly` və `secure` cookie kimi yazılır.
* **`cookie-parser`**: Express middleware kimi `main.ts`-də qeydiyyata alındı ki, `req.cookies` vasitəsilə cookie-lər avtomatik oxunsun.

### 1.3. Passport-JWT Strategiyası Və Custom Guard-lar (`libs/auth/src/guards/` & `strategies/`)
* **`JwtStrategy`**: Passport-JWT strategiyası yazıldı. Tokeni həm HTTP `Authorization: Bearer` header-indən, həm də brauzerin `req.cookies.access_token` sahəsindən çıxarır və MongoDB-də istifadəçinin aktivliyini doğrulayaraq `req.user`-ə mənimsədir.
* **`JwtAuthGuard`**: `AuthGuard('jwt')`-dən varislik alır, `@Public()` metadatasını yoxlayaraq istəkləri keçirir və ya rədd edir.
* **`RoleGuard`**: `@Roles('admin')` metadatasını oxuyub `req.user.role` ilə müqayisə edir, icazəsi olmayanlara 403 Forbidden verir.
* **`app.useGlobalGuards`**: `main.ts`-də `JwtAuthGuard` qlobal təyin edildi. Nəticədə tətbiqdəki bütün marşrutlar susmaya görə 100% qorundu, açıq marşrutlara (məsələn: `/api/db-health`) `@Public()` əlavə olundu.

### 1.4. Custom Dekoratorlar (`libs/auth/src/decorators/`)
* **`@Public()`**: Marşrutu hər kəs üçün açıq edir.
* **`@Roles('admin')`**: Tələb olunan rolları təyin edir.
* **`@Auth('admin')`**: `JwtAuthGuard`, `RoleGuard` və `@Roles(...)` dekoratorlarını tək bir yerə toplayır.
* **`@CurrentUser()`**: Controller-də `req.user` obyektini avtomatik çıxarır.

### 1.5. Postman İlə Test Və Sənədləşdirmə (`TestingWithPostman.md`)
* `libs/auth/TestingWithPostman.md` faylında Google Playground-dan `idToken` almaq və Postman-da 5 əsas test ssenarisi (Login, Me, Refresh, Logout, Public) addım-addım sənədləşdirildi və 200 OK ilə sınaqdan keçirildi.
* `libs/auth/src/README.md` master oxuma xəritəsi yaradıldı.

---

## 🎯 2. Müəllimdən Xülasə Qeyd

Kimlik doğrulanması (Authentication) sistemi tam olaraq `cookie-parser`, `google-auth-library`, `@nestjs/jwt`, `passport-jwt` və NestJS Custom Decorator-ların inteqrasiyası ilə enterprise standartlarda quruldu! 🚀

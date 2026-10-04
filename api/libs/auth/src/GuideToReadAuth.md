# 🎓 Auth Library Master Learning Guide (Oxuma Sırası)

Əziz tələbə! 👋 `libs/auth` modulunu tam anlayıb bir NestJS Auth mütəxəssisi olman üçün bütün sənədləri sırayla oxuman kifayətdir. 

Bütün sistem tək bir zəncir kimi bir-birinə bağlıdır. Şifrələri, tokenləri, guard-ları və dekoratorları başa düşmək üçün aşağıdakı **MÜTƏLƏƏ SIRASI** ilə oxu:

---

## 🗺️ Xəritə və Oxunma Sırası (Roadmap)

```
 ┌────────────────────────────────────────────────────────┐
 │ 1️⃣  README.md (Sən buradasan - Əsas Giriş)             │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2️⃣  lib/authservice.md (Biznes Loqikası & Tokenlər)    │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3️⃣  lib/auth.controller.md (Controller & İstək Sxemi) │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4️⃣  decorators/decorators.md (Custom Dekoratorlar)     │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 5️⃣  guards/guards.md (Təhlükəsizlik Keşikçiləri)      │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 6️⃣  strategies/strategies.md (Passport-JWT Strategiyası)│
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 7️⃣  lib/authmodule.md (NestJS Modul Bağlantıları)      │
 └────────────────────────────────────────────────────────┘
```

---

## 📚 Sənədlərin Xülasəsi və Keçidlər:

### 1️⃣ [lib/authservice.md](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/auth/src/lib/authservice.md)
* **Mövzu**: `AuthService` biznes loqikası.
* **Nələri öyrənəcəksən?**: Google token yoxlanması, JWT tokenlərinin yaradılması, HttpOnly cookie-lərin təyin olunması və `.env` vasitəsilə `clientId`-nin bura necə çatması.

### 2️⃣ [lib/auth.controller.md](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/auth/src/lib/auth.controller.md)
* **Mövzu**: `GoogleAuthController` və İstək Ötürmə Sxemi (Request Life Cycle).
* **Nələri öyrənəcəksən?**: HTTP İstəyinin (Request) daxil olduğu andan `cookie-parser`, `guards`, `decorators`, `strategy`, `controller` və `service` vasitəsilə cavab verilənə qədər keçdiyi tam sxem.

### 3️⃣ [decorators/decorators.md](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/auth/src/decorators/decorators.md)
* **Mövzu**: Özel Dekoratorlar (`@Public()`, `@Roles()`, `@Auth()`, `@CurrentUser()`).
* **Nələri öyrənəcəksən?**: Metadata necə vurulur, `@Auth()` necə çoxlu guard-ı bir yerdə toplayır və `@CurrentUser()` necə `req.user`-dən istifadəçi obyektini süzür.

### 4️⃣ [guards/guards.md](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/auth/src/guards/guards.md)
* **Mövzu**: `JwtAuthGuard` və `RoleGuard`.
* **Nələri öyrənəcəksən?**: İstəklərin qarşısını alan keşikçilər (Guards), `@Public()` olduqda icazə vermək, tokenin vaxtı bitdikdə 401 qaytarmaq və rol çatmadıqda 403 Forbidden vermək.

### 5️⃣ [strategies/strategies.md](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/auth/src/strategies/strategies.md)
* **Mövzu**: Passport `JwtStrategy`.
* **Nələri öyrənəcəksən?**: `passport-jwt` paketinin tokeni brauzer cookie-sindən və ya Bearer Header-dən tapması, MongoDB-də istifadəçini doğrulaması və nəticəni `req.user`-ə yazması.

### 6️⃣ [lib/authmodule.md](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/auth/src/lib/authmodule.md)
* **Mövzu**: `AuthModule`.
* **Nələri öyrənəcəksən?**: `MongooseModule`, `PassportModule` və `JwtModule`-un NestJS Dependency Injection konteyneri ilə birləşməsi.

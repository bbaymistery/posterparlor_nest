# 🌐 GoogleAuthController Master Guide (`auth.controller.md`)

Bu sənəd `libs/auth/src/lib/auth.controller.ts` faylındakı `GoogleAuthController` klasının, onun route-larının, dekoratorlarının və istək axınının (**Ötürmə Sxemi**) ətraflı izahıdır.

---

## 🧭 Ümumi Controller Məqsədi

`GoogleAuthController` tətbiqin HTTP API giriş qapısıdır (`/api/auth/google`).
Əsas vəzifəsi:
- Client-dən (Frontend) gələn HTTP istəklərini (Request) qəbul etmək.
- Təhlükəsizlik Guard-larından (`JwtAuthGuard`, `RoleGuard`) və Passport Strategy-dən keçirmək.
- Məlumatı `AuthService`-ə ötürüb nəticəni cavab (Response / Cookie) kimi client-ə qaytarmaq.

---

## 🕵️‍♂️ ƏN ƏSAS SUAL: Strateji (`JwtStrategy`) Haradan Gəldi? Necə Bağlandı?

Sən soruşursan ki:
> *"@Auth() dekoratorunda `applyDecorators(UseGuards(JwtAuthGuard, RoleGuard))` var, amma burada `JwtStrategy` sözü yoxdur! Bəs strateji bura necə gəlib çıxdı?"*

Bu NestJS vərdişlərindəki **ən böyük sirr və sehrdir**! Gəl bu zənciri addım-addım sökək:

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ 1. Controller @Auth() Dekoratorunu çağırır                                        │
 │    `@Auth('admin')` -> @UseGuards(JwtAuthGuard, RoleGuard) işə düşür.             │
 └────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                                          ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ 2. JwtAuthGuard İcra Olunur                                                      │
 │    `export class JwtAuthGuard extends AuthGuard('jwt')`                          │
 │    💡 Diqqət! `AuthGuard('jwt')` daxilindəki `'jwt'` açar sözünə baxın!           │
 └────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                                          ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ 3. NestJS Passport Reyestrində 'jwt' Strategiyasını Axtarır                      │
 │    `export class JwtStrategy extends PassportStrategy(Strategy)`                 │
 │    💡 `PassportStrategy(Strategy)` avtomatik olaraq bu strategiyanı              │
 │       NestJS daxilində `'jwt'` adı ilə qeydə alır!                               │
 └────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                                          ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │ 4. AuthModule Bütün Hissələri Birləşdirir                                         │
 │    `providers: [AuthService, JwtStrategy, JwtAuthGuard, RoleGuard]`              │
 │    NestJS DI Container `AuthGuard('jwt')`-in tələb etdiyi `JwtStrategy`-ni         │
 │    `providers` siyahısından tapır və bir-birinə bağlayır (Inject edir)!          │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 HTTP İstək Ötürmə Sxemi (Request Life Cycle Diagram)

Sistemdə iki fərqli sorğu tipi baş verə bilər: **Açıq Endpoint (məsələn: Login)** və **Qorunan Endpoint (məsələn: `/me` və ya Admin paneli)**.

---

### 🟢 Nümunə 1: Açıq Endpoint Axını (Google Login)

```
[ Client (React/Mobile) ]
       │
       │ 1. POST /api/auth/google/login  (Body: { idToken: "Google_Token_ABC..." })
       ▼
[ Express Middleware: cookie-parser ]  ---> req.cookies obyektini hazırlayır
       │
       ▼
[ Metadata Check: @Public() ]         ---> @Public() var! Guard-lar ləğv olunur, keçidə İCAZƏ verilir
       │
       ▼
[ Controller: GoogleAuthController ]  ---> googleLogin(dto, res) metodu çağırılır
       │
       ▼
[ Service: AuthService ]              ---> Google-dan idToken-i verify edir, DB-də user tapır/yaradır,
       │                                   JWT tokenlər düzəldir və res.cookie() ilə brauzerə yazır
       ▼
[ Client (Response) ]                 <--- 200 OK + { user: {...}, accessToken: "..." } + Set-Cookie Header
```

---

### 🔴 Nümunə 2: Qorunan Endpoint Axını (`GET /api/auth/google/me`) - Addım-Addım Ətraflıİzah

Bu sxem istifadəçinin sistemdə daxil olub-olmadığını `Passport` və `JwtStrategy` vasitəsilə necə yoxladığını ən xırda detalına qədər göstərir:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. Client (Frontend / React)                                                                     │
│    GET /api/auth/google/me                                                                       │
│    Cookie: access_token=eyJhbGciOiJIUzI1Ni...                                                   │
└─────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. Express Middleware (cookie-parser)                                                            │
│    HTTP Header-dəki cookie-ləri oxuyur və `req.cookies.access_token` sahəsinə yerləşdirir.       │
└─────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. Decorator Check: @Auth('admin')                                                               │
│    Metadata oxunur: `isPublic` = false, `roles` = ['admin'].                                     │
└─────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. JwtAuthGuard & Passport JwtStrategy Ətraflı İcrası:                                           │
│                                                                                                  │
│    a) JwtAuthGuard super.canActivate(context) çağırır.                                           │
│    b) super.canActivate() NestJS-də qeydiyyatda olan `JwtStrategy`-ni işə salır.                 │
│    c) JwtStrategy static extractJWTFromCookie(req) vasitəsilə tokeni `req.cookies.access_token`  │
│       hissəsindən çıxarır.                                                                       │
│    d) JwtStrategy `secretOrKey` vasitəsilə tokenin imzasını və vaxtının bitib-bitmədiyini yoxlayır.│
│    e) Yoxlanış keçərsə, JwtStrategy.validate(payload) metodu işə düşür.                          │
│    f) validate(payload) payload.sub (User ID) ilə MongoDB-dən istifadəçini tapır,                │
│       `user.isActive` yoxlayır və sanitized user obyektini qaytarır.                             │
│    g) Passport həmin qaytarılan user obyektini `req.user` daxilinə yerləşdirir!                  │
└─────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 5. RoleGuard İcrası                                                                              │
│    `req.user.role` === 'admin' olub-olmadığını yoxlayır. Uyğundursa keçidə İCAZƏ verilir!        │
└─────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 6. Controller Route Handler & @CurrentUser()                                                     │
│    @CurrentUser() dekortoru `req.user`-dən istifadəçi məlumatlarını götürür və metod icra olunur. │
└─────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 7. Client (Response)                                                                             │
│    200 OK + { id: "123", email: "user@gmail.com", role: "admin", name: "Ali" }                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📌 Route-ların Ətraflı İzahı

### 1️⃣ `POST /api/auth/google/login`
- **Dekoratorlar**: `@Public()`, `@Post('login')`, `@HttpCode(200)`
- **Məqsəd**: Google vasitəsilə daxil olmaq.
- **İş prinsipi**:
  - `@Public()` olduğu üçün JWT və ya Login tələb OLUNMUR.
  - Body-dən `GoogleLoginDto` (`idToken`) qəbul edir.
  - `authService.loginWithGoogle(dto.idToken, res)` çağırılır.
  - Təsdiqlənərsə `access_token` və `refresh_token` HttpOnly cookie olaraq yazılır.

---

### 2️⃣ `POST /api/auth/google/refresh`
- **Dekoratorlar**: `@Public()`, `@Post('refresh')`, `@HttpCode(200)`
- **Məqsəd**: Vaxtı bitmiş `access_token`-i yeniləmək.
- **İş prinsipi**:
  - `@Public()` dekortoru var, çünki `access_token` bitmiş ola bilər.
  - `req.cookies['refresh_token']` oxunur.
  - Token yoxdursa `401 UnauthorizedException` atır.
  - Token varsa `authService.refreshAccessToken(token, res)` çağırılaraq yeni `access_token` cookie-yə yazılır.

---

### 3️⃣ `GET /api/auth/google/me`
- **Dekoratorlar**: `@Auth()`, `@Get('me')`
- **Məqsəd**: Hazırda daxil olmuş istifadəçinin profil məlumatlarını almaq.
- **İş prinsipi**:
  - `@Auth()` vasitəsilə `JwtAuthGuard` işə düşür və cookie/header-dəki tokeni yoxlayır.
  - `@CurrentUser()` xüsusi parametrik dekortoru `req.user` obyektini avtomatik çıxarır.
  - Daxil olmuş istifadəçinin `AuthenticatedUser` obyektini qaytarır.

---

### 4️⃣ `POST /api/auth/google/logout`
- **Dekoratorlar**: `@Auth()`, `@Post('logout')`, `@HttpCode(200)`
- **Məqsəd**: Sistemdən çıxış etmək.
- **İş prinsipi**:
  - `@Auth()` vasitəsilə yalnız daxil olmuş istifadəçilər çıxış edə bilər.
  - `authService.logout(res)` çağırılır və brauzerdəki `access_token` və `refresh_token` cookie-ləri silinir.

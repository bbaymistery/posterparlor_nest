# 🔐 AuthService Master Guide (`authservice.md`)

Bu sənəd `libs/auth/src/lib/auth.service.ts` faylındakı `AuthService` klasının və onun daxilindəki hər bir funksiyanın tam olaraq nə iş gördüyünü, necə işlədiyini və hansı ardıcıllıqla çağırıldığını addım-addım izah edir.

---

## 🏛️ Ümumi Arxitektura və Məqsəd

`AuthService` bizim NestJS backend tətbiqimizin **Kimlik Doğrulama (Authentication)** mərkəzidir.
Bu servis aşağıdakı əsas işləri görür:
1. **Google OAuth2 Login**: Frontend-dən gələn Google `idToken`-ini Google serverləri vasitəsilə təsdiqləyir.
2. **User Menecmenti**: İstifadəçi bazada (MongoDB) yoxdursa yeni istifadəçi yaradır, varsa son giriş vaxtını (`lastLogin`) yeniləyir.
3. **JWT Token İstehsalı**: Qısa ömürlü `access_token` və uzun ömürlü `refresh_token` yaradır.
4. **HttpOnly Cookie Təhlükəsizliyi**: Tokenləri brauzerin təhlükəsiz `HttpOnly` cookie-lərinə yazır (və ya çıxış edəndə silir).

---

## 🛠️ İnjection və Konstruktor (Constructor)

```typescript
constructor(
  @InjectModel(User.name) private userModel: Model<UserDocument>,
  private jwtService: JwtService,
  private config: AppConfigService
) {
  const clientId = this.config.authConfig.clientId;
  this.client = new OAuth2Client(clientId);
}
```

* **`userModel`**: MongoDB-də `users` kolleksiyası ilə əlaqə qurmaq üçün Mongoose modeli.
* **`jwtService`**: JWT tokenləri imzalamaq (sign) və ya doğrulamaq (verify) üçün `@nestjs/jwt` servisi.
* **`config`**: `.env` faylından `JWT_SECRET`, `GOOGLE_CLIENT_ID` kimi konfiqurasiyaları oxuyan servis.
* **`this.client`**: `google-auth-library` paketindən gələn `OAuth2Client` obyekti. Google tokenlərini yoxlamaq üçün istifadə olunur.

---

## 🧩 Funksiyaların Ətraflı İzahı

---

### 1️⃣ `verifyGoogleToken(idToken: string)`

* **Nə iş görür?**: Frontend-in (React, Vue, Flutter və s.) Google ilə giriş etdikdən sonra backend-ə göndərdiyi `idToken`-in həqiqətən Google tərəfindən verildiyini və saxta olmadığını yoxlayır.
* **Necə işləyir?**:
  1. `this.client.verifyIdToken()` funksiyasını çağıraraq tokeni və `clientId`-ni Google-a təqdim edir.
  2. Google tokeni təsdiqlədikdə içindəki `payload` (istifadəçinin email-i, adı, şəkilləri və s.) qaytarır.
  3. Email təsdiqlənməyibsə və ya token keçərsizdirsə `UnauthorizedException` (401 xətası) atır.
* **Qayıdan Dəyər**: Google-dan gələn istifadəçi məlumatları obyekti (`TokenPayload`).

---

### 2️⃣ `generateTokens(user: UserDocument)`

* **Nə iş görür?**: Sistemdəki istifadəçi üçün 2 ədəd JWT token hazırlayır:
  * 🔑 **`accessToken`**: Qısa ömürlü (məsələn, 15 dəqiqə). Hər bir API istəyində istifadəçinin kimliyini doğrulamaq üçündür.
  * 🔄 **`refreshToken`**: Uzun ömürlü (məsələn, 7 gün). `accessToken`-in vaxtı bitdikdə yenisini almaq üçündür.
* **Necə işləyir?**:
  1. Tokenin içində saxlanılacaq `payload` obyektini hazırlayır (`sub: user._id`, `email`, `role`).
  2. `jwtService.sign()` vasitəsilə məxfilik açarları (`secret`) və bitmə vaxtları (`expiresIn`) ilə tokenləri imzalayır.
* **Qayıdan Dəyər**: `{ accessToken, refreshToken }` obyekti.

---

### 3️⃣ `setCookies(res: Response, tokens: Token)`

* **Nə iş görür?**: Yaradılmış `accessToken` və `refreshToken`-i brauzerə təhlükəsiz **HttpOnly Cookie** kimi göndərir.
* **Nə üçün HttpOnly Cookie?**:
  * Təhlükəsizlik üçün! `HttpOnly: true` olduqda, zərərli JavaScript kodları (XSS hücumları) brauzerdəki tokeni oxuya BİLMİR.
  * Production mühitində `secure: true` edilərək tokenlərin yalnız HTTPS üzərindən ötürülməsi təmin olunur.
* **Qayıdan Dəyər**: `void` (cavab obyekti üzərində cookie-ləri təyin edir).

---

### 4️⃣ `loginWithGoogle(idToken: string, res: Response)`

* **Nə iş görür?**: Google ilə giriş proseyindəki **əsas ana funksiyadır**.
* **İşləmə Sırası (Workflow)**:
  1. `verifyGoogleToken(idToken)` çağırılaraq Google tokeni yoxlanılır.
  2. İstifadəçinin email-i ilə bazada (`userModel.findOne({ email })`) axtarış edilir.
  3. **İstifadəçi Yoxdursa**: Bazada yeni `User` sənədi yaradılır (`userModel.create`).
  4. **İstifadəçi Varsa**: Hesabının aktiv olub-olmadığı yoxlanılır (`isActive`), son giriş tarixi (`lastLogin`) yenilənir.
  5. `generateTokens(user)` çağırılaraq JWT tokenlər yaradılır.
  6. `setCookies(res, tokens)` çağırılaraq tokenlər cookie-yə yazılır.
* **Qayıdan Dəyər**: `{ accessToken, user: { id, email, name, role } }`.

---

### 5️⃣ `refreshAccessToken(refreshAccessToken: string, res: Response)`

* **Nə iş görür?**: `access_token`-in vaxtı bitdikdə, istifadəçini yenidən sistemə daxil etmədən (login etdirmədən) yeni `access_token` verir.
* **Necə işləyir?**:
  1. Brauzerdən gələn `refresh_token` məxfilik açarı (`jwtRefreshTokenSecret`) ilə yoxlanılır (`jwtService.verify`).
  2. Tokenin içindəki `sub` (User ID) ilə istifadəçi bazada tapılır və aktivliyi yoxlanılır.
  3. Hər şey qaydasındadırsa, yeni `access_token` yaradılır və yenidən Cookie-yə təyin edilir.
* **Qayıdan Dəyər**: `{ accessToken }`.

---

### 6️⃣ `logout(res: Response)`

* **Nə iş görür?**: İstifadəçinin sistemdən çıxış etməsini təmin edir.
* **Necə işləyir?**:
  1. Brauzerdəki `access_token` cookie-sini silir (`clearCookie`).
  2. Brauzerdəki `refresh_token` cookie-sini silir (`clearCookie`).
* **Qayıdan Dəyər**: `{ message: 'Logged out successfully' }`.

---

## 🔄 Bütünlüklü Əlaqə Diaqramı (Sequence Diagram)

```
[ Frontend (Client) ]               [ AuthService (NestJS) ]                [ Google Server ]       [ MongoDB ]
          |                                    |                                    |                    |
          |--- 1. loginWithGoogle(idToken) --->|                                    |                    |
          |                                    |--- 2. verifyGoogleToken(idToken) ->|                    |
          |                                    |<-- 3. Return Google Payload -------|                    |
          |                                    |                                                         |
          |                                    |--- 4. findOne({ email }) ------------------------------->|
          |                                    |<-- 5. Return User Document -----------------------------|
          |                                    |
          |                                    |--- 6. generateTokens(user) (JWT Sign)
          |                                    |--- 7. setCookies(res, tokens) (Set HttpOnly Cookies)
          |<-- 8. Return AuthResponse ---------|
```

---

## 💡 Nümunə İstifadə (Controller daxilində)

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleLogin(@Body('idToken') idToken: string, @Res({ passthrough: true }) res: Response) {
    return this.authService.loginWithGoogle(idToken, res);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}
```

---

## ❓ `clientId` və Konfiqurasiya Dəyişənləri `AuthService`-ə Necə Çatır?

Kodda `clientId` sözünü birbaşa `.env`-yə yazmasanız da, sistemdə **4 mərhələli zəncirvari ötürmə (Mapping)** baş verir:

### 1️⃣ Mühit Dəyişənləri (`development.env`)
`.env` faylında Google və JWT açarları bu adlarla saxlanılır:
```env
GOOGLE_CLIENT_ID=713469299798-6kacreihtfm7uaoujnv7havj1mbalftb.apps.googleusercontent.com
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
```

### 2️⃣ `AppConfigService` (`libs/config/src/lib/config.service.ts`)
`AppConfigService` daxilindəki `get authConfig()` getter funksiyası env dəyişənlərini obyekt sahələrinə mənimsədir:
```typescript
get authConfig() {
  return {
    clientId: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
    jwtAccessTokenExpiry: this.timeStringToMilliseconds(
      this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRES_IN')
    ),
  };
}
```

### 3️⃣ `AuthService` daxilində İnjection (Asılılığın İnyeksiyası)
`AuthService`-in konstruktorunda `AppConfigService` daxil edilir:
```typescript
constructor(
  private config: AppConfigService
) {
  const clientId = this.config.authConfig.clientId;
}
```

### 🔄 Qısaca Ötürmə Sxemi:

```
[ development.env ]
  GOOGLE_CLIENT_ID = "713469..."
        │
        ▼ (NestJS ConfigService oxuyur)
[ AppConfigService (config.service.ts) ]
  get authConfig() {
    return {
      clientId: ConfigService.get('GOOGLE_CLIENT_ID')  <-- Ad 'clientId' kimi mənimsədilir
    }
  }
        │
        ▼ (AuthService-də çağırılır)
[ AuthService (auth.service.ts) ]
  this.config.authConfig.clientId  <-- Artıq bu adla dəyərə çatır!
```


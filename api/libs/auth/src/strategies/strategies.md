# 🔑 JwtStrategy Master Guide (`strategies.md`)

Bu sənəd `libs/auth/src/strategies/jwt.strategy.ts` faylındakı `JwtStrategy` klasının necə işlədiyini, `passport-jwt` paketi ilə necə əlaqə qurduğunu və tokenləri necə doğruladığını ətraflı izah edir.

---

## 🏛️ Passport və Strategy Nədir?

`@nestjs/passport` sistemi tətbiqdə kimlik doğrulanmasını (Authentication) modullara bölür.
- **Passport**: Kimlik doğrulanması karkasıdır (framework).
- **Strategy**: Xüsusi doğrulama üsuludur (məsələn: JWT, Local Username/Password, Google OAuth).

Bizim `JwtStrategy` klasımız `PassportStrategy(Strategy)` klasından varislik alır (inherit edir). Yəni biz Passport-a deyirik: **"Bizim JWT doğrulama qaydalarımız bu klasın daxilində yazılıb!"**

---

## 🛠️ Konstruktor (Constructor) və Seçimlər (Options)

```typescript
constructor(
  @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  config: AppConfigService
) {
  const secret = config.authConfig.jwtAccessTokenSecret;

  const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(), // 1. Header-dən tap (Authorization: Bearer <token>)
      JwtStrategy.extractJWTFromCookie,         // 2. Cookie-dən tap (access_token=<token>)
    ]),
    ignoreExpiration: false, // Bitmiş tokenləri avtomatik rədd et
    secretOrKey: secret,      // Tokeni imzalayan məxfilik açarı
  };

  super(options);
}
```

### 🔍 Tokenin Tapılması (Extractors):
Sistem daxil olan HTTP istəyində tokeni 2 yerdən axtarır:
1. **Bearer Token Header**: `Authorization: Bearer eyJhbGci...`
2. **HttpOnly Cookie**: `req.cookies.access_token` (`extractJWTFromCookie` statik metodu vasitəsilə).

---

## 🧪 Statik Metod: `extractJWTFromCookie(req: Request)`

```typescript
private static extractJWTFromCookie(req: Request): string | null {
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }
  return null;
}
```
* **Məqsəd**: Əgər frontend tokeni `Header`-də göndərməyibsə, brauzerin `HttpOnly` cookie-lərinin içindəki `access_token`-i çıxarıb Passport-a verir.

---

## ⚙️ `validate(payload: JwtTokenPayload)` Metodu (Ən Əsas Hissə)

Passport JWT-nin imzasını (`secretOrKey`) və vaxtını (`ignoreExpiration: false`) uğurla yoxladıqdan sonra tokenin içindəki açılmış məlumatı (`payload`) bu `validate()` metoduna ötürür.

```
JWT Token (Şifrələnmiş String) ──► Passport Verify ──► Decoded Payload ──► validate(payload)
```

### 📋 `validate()` daxilində baş verən 5 təhlükəsizlik yoxlanışı:

1. **Payload Doğrulaması**: `sub` (User ID), `email` və `role` varlıqları yoxlanılır.
2. **MongoDB ObjectId Yoxlanışı**: `Types.ObjectId.isValid(payload.sub)` ilə ID-nin formatı yoxlanılır.
3. **Bazada Axtarış**: `userModel.findById(payload.sub)` vasitəsilə istifadəçi MongoDB-dən tapılır.
4. **Hesabın Aktivliyi**: `if (!user.isActive)` istifadəçinin qadağan olunub-olunmadığı yoxlanılır.
5. **Email Dəyişməzliyi**: Token veriləndən sonra bazadakı email dəyişibsə token ləğv edilir.

### 🎯 Qayıdan Dəyər:
`validate()` metodu aşağıdakı istifadəçi obyektini qaytarır:
```typescript
return {
  id: user._id.toString(),
  email: user.email,
  role: user.role,
  name: user.name,
};
```
👉 **ÇOX MÜHÜM**: Passport bu qaytarılan obyekti avtomatik olaraq Express `req.user` obyektinə mənimsədir! Beləliklə, Controller-də `@CurrentUser()` dedikdə həmin bu obyekt əldə edilir.

# 🎨 Decorators Master Guide (`decorators.md`)

Bu sənəd `libs/auth/src/decorators/auth.decorator.ts` faylındakı xüsusi dekoratorların nə iş gördüyünü izah edir.

---

## 📌 Dekoratorlar siyahısı

### 1️⃣ `@Public()`
- **Məqsəd**: Route-u hər kəs üçün açıq edir (autentifikasiya tələb olunmur).
- **Kod**: `SetMetadata('isPublic', true)`
- **İstifadəsi**: Login, Register, Refresh Token kimi açıq endpoint-lərdə.

---

### 2️⃣ `@Roles(...roles: UserRole[])`
- **Məqsəd**: Route-a müraciət edə biləcək rolları təyin edir.
- **Kod**: `SetMetadata('roles', roles)`
- **İstifadəsi**: `@Roles('admin')` və ya `@Roles('admin', 'seller')`.

---

### 3️⃣ `@Auth(...roles: UserRole[])`
- **Məqsəd**: Çoxlu guard və dekoratorları tək bir dekoratorda birləşdirir (Composition).
- **İş prinsipi**:
  - `roles` ötürülməyibsə: Yalnız `JwtAuthGuard`-ı tətbiq edir.
  - `roles` ötürülübsə: Həm `JwtAuthGuard`, həm `RoleGuard`, həm də `@Roles(...)` metadata-sını birgə tətbiq edir (`applyDecorators`).
- **Nümunə**: `@Auth('admin')` -> İstənilən istifadəçi həm login olmalı, həm də admin roluna malik olmalıdır.

---

### 4️⃣ `@CurrentUser(data?: keyof AuthenticatedUser)`
- **Məqsəd**: Controller daxilində `req.user` obyektini və ya onun müəyyən sahəsini avtomatik çıxarıb metod parametrinə ötürür.
- **Nümunə**:
  ```typescript
  // Bütün istifadəçi obyektini almaq:
  @Get('me')
  getProfile(@CurrentUser() user: AuthenticatedUser) { ... }

  // Yalnız email almaq:
  @Get('email')
  getEmail(@CurrentUser('email') email: string) { ... }
  ```

# 🛡️ Guards Master Guide (`guards.md`)

Bu sənəd `libs/auth/src/guards/` qovluğundakı `JwtAuthGuard` və `RoleGuard` guard-larının necə işlədiyini izah edir.

---

## 1️⃣ `JwtAuthGuard` (`jwt-auth.guard.ts`)

* **Məqsəd**: HTTP istəyinin autentifikasiyadan (giriş etmiş istifadəçi) keçib-keçmədiyini yoxlayır.
* **Tərkibi və İş Prinsipi**:
  1. `Reflector` vasitəsilə müraciət olunan route-da `@Public()` dekortorunun olub-olmadığını yoxlayır (`isPublic`).
  2. **`isPublic === true`**: İcazə verir, autentifikasiya tələb etmir (`return true`).
  3. **Açıq deyilse**: `super.canActivate(context)` çağıraraq Passport-un `JwtStrategy` mexanizmini işə salır.
  4. **`handleRequest()`**:
     - Tokenin vaxtı bitibsə -> `Token has expired` (401)
     - Token zədəlidirsə -> `Invalid token` (401)
     - Token yoxdursa -> `Login Required to access this resource` (401)

---

## 2️⃣ `RoleGuard` (`role.guard.ts`)

* **Məqsəd**: İstifadəçinin müəyyən edilmiş rola (məsələn, `admin`, `user`) malik olub-olmadığını yoxlayır (Authorization).
* **Tərkibi və İş Prinsipi**:
  1. `Reflector` vasitəsilə müraciət olunan route-dakı `@Roles('admin')` metadata-nı oxuyur (`requiredRole`).
  2. Heç bir rol tələb olunmursa (`!requiredRole`), keçidə icra verir (`return true`).
  3. `req.user` obyektindəki `user.role` dəyərini tələb olunan rollar siyahısı ilə müqayisə edir.
  4. İstifadəçinin rolu uyğun gəlməzsə `403 ForbiddenException` (`Access denied. Required role(s): admin`) xətası atır.

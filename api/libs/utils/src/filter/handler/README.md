# 🛠️ Exception Error Handlers (`libs/utils/src/filter/handler`)

Bu qovluqda NestJS tətbiqində baş verə biləcək fərqli xəta növlərini (Mongoose, MongoDB, HTTP, Xüsusi xətalar) nizamlı şəkildə qarşılayan və eyni standart JSON formatına salan **5 xüsusi xəta işləyicisi (Handler)** yerləşir.

---

## 📁 Faylların Tərkibi Və Müəllim İzahı

### 📄 1. `generic-error.handler.ts` (`handleGenericError`)
* **Nə vaxt işləyir?** Proqnozlaşdırıla bilməyən, tutulmamış gözlənilməz JavaScript xətaları (məs: `TypeError: Cannot read property of undefined`) baş verdikdə.
* **Qaydası:** `500 Internal Server Error` status kodu qaytarır.

---

### 📄 2. `http-error.handler.ts` (`handleHttpError`)
* **Nə vaxt işləyir?** NestJS-in standart `HttpException` xətaları (məs: `NotFoundException`, `UnauthorizedException`, `BadRequestException`) fırladıldıqda.
* **Qaydası:** `ValidationPipe` tərəfindən gələn 400 xətalarını və ya `CustomHttpException` mətnlərini tutub oxunaqlı formata salır.

---

### 📄 3. `mongo-error.handler.ts` (`handleMongoError`)
* **Nə vaxt işləyir?** Düzdan MongoDB drayver xətaları gəldikdə.
* **Ən Vacib Özəlliyi (Təkrar Yoxlaması):**
  ```typescript
  const isDuplicate = exception.code === 11000;
  ```
  MongoDB-də unikal (unique) sahə (məsələn: eyni e-poçt ünvanı) təkrar daxil ediləndə MongoDB `11000` kodlu xəta verir. Bu handler həmin xətanı tutur və `409 Conflict` statusu ilə `Resource already exists` cavabı qaytarır.

---

### 📄 4. `mongoose-cast-error.handler.ts` (`handleMongooseCastError`)
* **Nə vaxt işləyir?** Yanlış ID formatı göndərildikdə (`CastError`).
* **Nümunə:** Məsələn, MongoDB ObjectId 24 simvollu hex mətni olmalıdır. İstifadəçi URL-də `GET /api/users/123` yazarsa, Mongoose id-ni çevirə bilmir (Cast edə bilmir).
* **Qaydası:** `400 Bad Request` qaytarır: `Invalid _id: 123`.

---

### 📄 5. `validation-error.handler.ts` (`handleMongooseValidationError`)
* **Nə vaxt işləyir?** Mongoose Schema valideyn qaydaları pozulduqda (məs: `required: true` olan sahə boş olduqda).
* **Qaydası:** Schema daxilindəki bütün xətaları yığır və `400 Bad Request` statusu ilə sahə-sahə `validationErrors` massivində qaytarır.

---

## 🎯 Müəllimdən Xülasə Qeyd

Bu handler-lər sayəsində layihədə xəta hardan gəlir-gəlsin (istər MongoDB, istər Mongoose, istər NestJS), istifadəçiyə HƏMİŞƏ eyni standartlı, gözəl JSON cavabı gedir! 🚀

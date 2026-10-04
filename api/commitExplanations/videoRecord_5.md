# 🎥 Video Record #5 — Global Exception Handling, Response Interception & Utilities Setup

Bu sənəd **Video #5** çərçivəsində `new-poster-parlor-api` monorepo layihəsində həyata keçirilən **Qlobal Xəta Filtri (`GlobalExceptionFilter`), Uğurlu Cavab Interceptor-u (`ResponseInterceptor`) və Utility Yardımçılarının (`libs/utils`)** sıfırdan qurulması və inteqrasiyasının tam izahıdır.

---

## 📌 1. Nələr Edildi? (Əsas Dəyişikliklər Və Əlavələr)

### 1.1. Qlobal Xəta Filtri Və Handler-lər (`libs/utils/src/filter/`)
* **`GlobalExceptionFilter`**: NestJS-də baş verən bütün xətaları mərkəzi tutan `@Catch()` filtri yazıldı.
* **5 Xüsusi Handler Yaradıldı (`filter/handler/`)**:
  1. `http-error.handler.ts`: Standart HTTP xətalarını (400, 401, 404) qarşılayır.
  2. `validation-error.handler.ts`: Mongoose schema validation xətalarını sahə-sahə çıxarır.
  3. `mongoose-cast-error.handler.ts`: Yanlış ID formatı (CastError) daxil edildikdə `Invalid _id` qaytarır.
  4. `mongo-error.handler.ts`: MongoDB drayver xətalarını və `code === 11000` olduqda unikal sahə təkrarı (409 Conflict) xətasını tutur.
  5. `generic-error.handler.ts`: Gözlənilməz JavaScript xətalarını (500 Internal Server Error) qarşılayır.

### 1.2. Uğurlu Cavab Interceptor-u (`libs/utils/src/interceptor/`)
* **`ResponseInterceptor`**: Bütün uğurlu HTTP cavablarını (200 OK, 201 Created) tutan RxJS interceptor-u yazıldı.
* Cavabları standart `{ success: true, message: ..., data: ..., statusCode: ..., timestamp: ..., path: ... }` formatına salır və icra müddətini (ms) loqlayır.

### 1.3. Custom Exceptions Və Utilities (`libs/utils/src/lib/`)
* **`http-exception.ts`**: `CustomHttpException`, `ValidationException`, `NotFoundCustomException` sinifləri yazıldı.
* **`http-response.ts`**: `HttpResponseUtil.success()`, `created()`, `updated()`, `deleted()` statik yardımçıları yaradıldı.
* **`stack-trace-parser.ts`**: Development rejimində xətanın fayl/sətir yerini təmiz massivə salan parser yazıldı.

### 1.4. `main.ts` İnteqrasiyası (`apps/api/src/main.ts`)
* `app.useGlobalPipes(new ValidationPipe({...}))`
* `app.useGlobalFilters(new GlobalExceptionFilter(logger))`
* `app.useGlobalInterceptors(new ResponseInterceptor(logger))`

### 1.5. Master Arxitektura Və İcra Zənciri Sənədləşdirməsi (`README.md`)
* `libs/utils/src/README.md` və `libs/utils/README.md` fayllarında HTTP sorğu icra zənciri (Mermaid diaqramı), Interceptor və Filter-lərin işləmə prinsipləri və proyektimiz üzrə canlı addım-addım icra ssenariləri (Uğurlu `GET /api/db-health` və Xətalı `GET /api/unknown-route`) detallı sənədləşdirildi.

---

## 🎯 2. Müəllimdən Xülasə Qeyd

`libs/logger`, `libs/config` və `libs/utils` modulları tam müstəqil **Enterprise Skelet Modullardır (Boilerplate)**. Bu 3 kitabı istənilən başqa NestJS proyekti başlanğıcına təkrar-təkrar köçürüb istifadə etmək mümkündür! 🚀


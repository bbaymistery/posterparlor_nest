# 🛡️ Global Exception Filter (`libs/utils/src/filter`)

Bu qovluqda NestJS tətbiqində baş verən **BÜTÜN xətaları qlobal olaraq tutan, loqlayan və uyğun işləyiciyə (Handler) yönləndirən Mərkəzi Xəta Filtri (`GlobalExceptionFilter`)** yerləşir.

---

## 🔬 Kodun İzahı Və İşləmə Məntiqi

### 📍 1. `@Catch()` Dekoratoru Və İnterfeys
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}
```
* **`@Catch()`**: Heç bir parametr verilmədikdə tətbiq daxilində baş verən istənilən xətanı (HTTP xətaları, Baza xətaları, Sintaksis xətaları) MƏRKƏZİ olaraq tutur.
* **`AppLogger`**: Xətanı fayla və konsola loqlamaq üçün Winston Logger servisini inject edir.

---

### 📍 2. Xətanın Növünə Görə Yönləndirilməsi (`catch` Metodu)
```typescript
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const path = req.url;

    let errorResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      errorResponse = handleHttpError(exception, path);
    } else if (exception instanceof MongooseError.ValidationError) {
      errorResponse = handleMongooseValidationError(exception, path);
    } else if (exception instanceof MongooseError.CastError) {
      errorResponse = handleMongooseCastError(exception, path);
    } else if (exception instanceof MongoError) {
      errorResponse = handleMongoError(exception, path);
    } else {
      errorResponse = handleGenericError(exception, path);
    }
```
* **İzahı:** Filter xətanı tutan kimi `instanceof` ilə onun növünü yoxlayır və `handler/` qovluğundakı uyğun funksiyaya ötürərək standart `ErrorResponse` obyektini alır.

---

### 📍 3. Development Rejimində Stack Trace Və Loqlama
```typescript
    if (process.env['NODE_ENV'] === 'development') {
      if (exception instanceof Error) {
        const stackFrames = parseStackTrace(exception, 3);
        if (stackFrames.length > 0) {
          metadata['trace'] = stackFrames;
        }
      }
    }

    this.logger.errorWithMetadata(logMessage, exception, metadata);
    res.status(errorResponse.statusCode).json(errorResponse);
```
* **İzahı:** Xəta məlumatlarını `logger.errorWithMetadata()` ilə fayla yazır və brauzerə/müştəriyə `res.status().json()` ilə səliqəli cavab qaytarır.

# ⚡ Response Interceptor (`libs/utils/src/interceptor`)

Bu qovluqda uğurla tamamlanan BÜTÜN HTTP sorğularının (GET, POST, PUT, DELETE) cavablarını tutan və onları **standartlaşdırılmış uğurlu JSON formatına salan `ResponseInterceptor`** yerləşir.

---

## 🔬 Kodun İzahı Və İşləmə Məntiqi

### 📍 1. `NestInterceptor` Və RxJS Operatoları
```typescript
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const startTime = Date.now();
```
* **İzahı:** Sorğu kontrollerə daxil olan an `startTime` qeyd edilir.

---

### 📍 2. Cavabın Standartlaşdırılması (`map` Operaktoru)
```typescript
    return next.handle().pipe(
      map((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode || HttpStatus.OK;

        // HTTP sorğusunu loqlayırıq
        this.logger.logWithMetadata(
          `${request.method} ${request.url} ${statusCode} - ${duration}ms`,
          { method: request.method, url: request.url, statusCode, duration }
        );

        // Standart Uğurlu JSON Cavabı
        return {
          success: true,
          message: this.getMessage(request.method, statusCode),
          data: data || null,
          statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      })
    );
```

#### 🎯 Cavab Strukturu:
Hər bir uğurlu istəyin cavabı brauzerə belə çatır:
```json
{
  "success": true,
  "message": "Resource fetched successfully",
  "data": { ... },
  "statusCode": 200,
  "timestamp": "2026-09-22T14:20:00.000Z",
  "path": "/api/users"
}
```

* **Faydası:** Frontend tərtibatçısı hər zaman cavabın içində `success: true` və `data` obyektinin gələcəyinə 100% əmin olur!

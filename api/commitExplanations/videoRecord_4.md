# 🎥 Video Record #4 — Enterprise MongoDB & Health Monitoring System Setup

Bu sənəd **Video #4** çərçivəsində `new-poster-parlor-api` monorepo layihəsində həyata keçirilən **MongoDB Verilənlər Bazası Modulunun (`libs/database`)** sıfırdan qurulması, dinamik konfiqurasiyası, monitorinqi və sağlamlıq yoxlaması (Health Check) dəyişikliklərinin tam izahıdır.

---

## 📌 1. Nələr Edildi? (Əsas Dəyişikliklər Və Əlavələr)

### 1.1. MongoDB Konfiqurasiya Faylı (`database.config.ts`)
* `buildMongoConfig(config: AppConfigService)` funksiyası yazıldı.
* `AppConfigService` vasitəsilə `.env`-dən `DB_URL`, `DB_NAME` və `POOL_SIZE` dəyərləri oxunur.
* Production və Development mühitləri üçün fərqli Mongoose parametrləri quruldu:
  * **Pool Size:** Maksimum qoşulma sayı `POOL_SIZE`, minimum isə onun 20%-i (`Math.floor(poolSize * 0.2)`) olaraq təyin edildi.
  * **Timeouts:** Production mühitində server seçimi üçün 30 saniyə (`30000ms`), lokal mühitdə isə 5 saniyə (`5000ms`) vaxt verildi.
  * **Auto-Indexing:** Production-da performans itkisinin qarşısını almaq üçün `autoIndex: false` və `autoCreate: false` edildi.
  * **ZLib Sıxlaşdırma:** Şəbəkə trafikinə qənaət etmək üçün `compressors: ['zlib']` əlavə olundu.

### 1.2. Qoşulma Vəsaitləri Və Event Listener-lər (`database.connection.ts`)
* `setUpMongoDbConnection()` funksiyası yaradıldı.
* Mongoose Connection obyektinə `connected`, `disconnected`, `reconnected`, `error`, `close` event-ləri bağlandı.
* Production mühitində avtomatik sorğu monitorinqi (`registerQueryMonitoring`) aktivləşdirildi.

### 1.3. Yavaş Sorğu Və Performans Monitorinqi (`database.monitoring.ts`)
* `registerQueryMonitoring()` funksiyası ilə MongoDB drayverinin `commandStarted`, `commandSucceded` və `commandFailed` hadisələri dinlənilir.
* İcra müddəti 1 saniyədən (`1000ms`) çox çəkən sorğular avtomatik `Slow query detected` xəbərdarlığı ilə loqlanır.

### 1.4. Mərkəzi Database Modulu (`database.module.ts`)
* `MongooseModule.forRootAsync()` vasitəsilə NestJS Dependency Injection konteynerinə qoşuldu.
* `inject: [AppConfigService]` və `useFactory` vasitəsilə `buildMongoConfig` və `connectionFactory` birləşdirildi.
* `@Global()` mühitə uyğunlaşdırılaraq layihənin istənilən yerindən verilənlər bazasına çıxış təmin edildi.
* `apps/api/src/app/app.module.ts` faylındakı `imports` massivinə `DatabaseModule` əlavə edildi.

### 1.5. Baza Sağlamlığı Sisteminin Qurulması (`libs/database/src/lib/health/`)
* **`db.interface.ts`**: Sağlamlıq metrikaları (`DBHealthMetrics`) və cavab strukturu (`DBHealthCheckResult`) üçün interfeyslər yaradıldı.
* **`health.checker.ts`**: Baza ilə pinq əlaqəsini yoxlayan, latensiyanı (gecikməni ms ilə) ölçən və MongoDB versiyasını (məs: 7.0.5) oxuyan sinif.
* **`health.monitor.ts`**: Hər 30 saniyədən bir fon rejimində avtomatik yoxlama aparan və ardıcıl xətaları qeydə alan monitor.
* **`database.service.ts`**: `OnModuleInit` və `OnModuleDestroy` lifecycle hook-ları ilə baza qoşulmasını gözləyən və tətbiq bağlananda resursları təmiz bağlayan servis.
* **`database.controller.ts`**: GET `/api/db-health` endpoint-i ilə bazanın canlı statusunu qaytaran kontroller.

---

## 🎯 2. Gələcəkdə Baxanda Bilməli Olduğun Məqamlar

1. **Niyə `useFactory` İşlətdik?**
   Çünki baza konfiqurasiyası sabit text deyil. Bizə `AppConfigService` lazım idi və bu servisin `.env`-i oxuyub `DB_URL`-i Mongoose-a dinamik ötürməsini təmin etmək üçün `useFactory` istifadə olundu.

2. **Niyə `connectionFactory` Seçildi?**
   Mongoose bağlantı obyektini tam yaradan an event listener-ləri (`connected`, `error`) qoşmaq və sorğuların sürətini ölçmək üçün.

3. **`/api/db-health` Endpoint-i Nə Verir?**
   Bu endpoint bazanın canlı işlək vəziyyətdə olub-olmadığını, ping müddətini, qoşulu olduğu host və portu, bazanın adını və versiyasını JSON formatında qaytarır.

# 🎓 Enterprise Winston Logger Master Guide (`libs/logger/src/lib`)

Salam! Bu sənəddə biz `libs/logger/src/lib` qovluğundakı **bütün kodları, arxitekturanı, funksiyaları və Winston-un NestJS ilə inteqrasiyasını** bir müəllim tərəfindən ən xırda detalına qədər addım-addım öyrənirik.

---

## 🧭 1. Ümumi Arxitektura və Struktur

Bu kitabxana layihədə baş verən bütün log-ları (məlumatlar, xəbərdarlıqlar, xətalar) həm terminalda gözəl rəngli görmək, həm də server diskində günlərə görə avtomatik arxivlənən fayllara yazmaq üçün yaradılıb.

### 📁 `src/lib` Qovluğunun Tərkibi:
1. **`logger.config.ts`** — Logların formatı, vaxt zonası, terminal və fayl transport-larının (`DailyRotateFile`) bütün qaydaları burada təyin olunur.
2. **`logger.service.ts`** — Winston-u NestJS-in standart `LoggerService` interfeysinə uyğunlaşdıran, əlavə metadata və kontekst imkanları verən Servis (`AppLogger`).
3. **`logger.module.ts`** — `AppLogger`-ı bütün proyekt üçün qlobal (`@Global()`) edən və Dependency Injection konteynerinə qeydiyyata alan NestJS Modulu.

---

## 🔬 2. Fayl-Fayl Və Sətir-Sətir Dərin İzah

---

### 📄 2.1. `logger.config.ts` — Winston Qaydaları və Konfiqurasiyası

Bu fayl bütün loqlama sisteminin "beyni"dir.

#### 📍 Sətir 1 - 34: Vaxt Formatlayıcı Funksiya (`tsFormat`)
```typescript
const tsFormat = (): string => {
  const now = new Date();
  const isOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + isOffset);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const day = String(istTime.getUTCDate()).padStart(2, '0');
  const month = months[istTime.getUTCMonth()];
  const year = istTime.getUTCFullYear();
  const hours = String(istTime.getUTCHours()).padStart(2, '0');
  const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
```
* **Niyə lazımdır?** Standart UTC vaxtı əvəzinə tam oxunaqlı, xüsusi vaxt formatı (`YYYY-MMM-DD HH:mm:ss`) yaradır. 
* **Necə işləyir?** Cari vaxtı götürür, ayların adını qısaldılmış massivdən alır (`Jan`, `Feb`, ...), gün, saat, dəqiqə və saniyələri 2 rəqəmli formatda (`padStart(2, '0')`) düzür.

#### 📍 Sətir 36 - 54: Production JSON Formatı (`productionFormat`)
```typescript
const productionFormat = winston.format.printf(
  ({ timestamp, level, message, context, trace, error, ...metadata }) => {
    const logObject: any = {
      '@timestamp': timestamp,
      level,
      message,
      context: context || 'Application',
    };

    if (error) logObject.error = error;
    if (trace) logObject.trace = trace;

    if (Object.keys(metadata).length > 0) {
      logObject.metadata = metadata;
    }

    return JSON.stringify(logObject);
  }
);
```
* **Niyə lazımdır?** Production mühitində log fayllarına yazılan hər bir sətri səliqəli JSON obyektinə çevirir.
* **Detalları:**
  * `@timestamp`: Logun yazıldığı dəqiq vaxt.
  * `level`: Logun dərəcəsi (`info`, `warn`, `error`).
  * `message`: Əsas mesaj.
  * `context`: Logun hansı servisdən/kontrollerdən gəldiyi (göndərilməzsə default `'Application'`).
  * `error` və `trace`: Xəbərdarlıq və ya xəta varsa, onun adı və stack trace-i.
  * `...metadata`: İstək zamanı göndərilən digər bütün əlavə parametrlər.

#### 📍 Sətir 56 - 65: Terminal Çıxışı (`consoleTransport`)
```typescript
const consoleTransport = new winston.transports.Console({
  level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    nestWinstonModuleUtilities.format.nestLike('PosterParlor', {
      prettyPrint: true,
      colors: true,
    })
  ),
});
```
* **Məntiqi:** Development rejimində `debug` səviyyəli logları da göstərir, Production-da isə yalnız `info` və daha yuxarı səviyyələri göstərir.
* **Xüsusiyyəti:** `nestWinstonModuleUtilities.format.nestLike` vasitəsilə NestJS-in özünəməxsus gözəl, rəngli və prefiksli (`[PosterParlor]`) terminal çıxışını təmin edir.

#### 📍 Sətir 67 - 84: Əsas Log Faylı (`fileInfoTransport`)
```typescript
const fileInfoTransport = new winston.transports.DailyRotateFile({
  dirname: 'logs',
  filename: 'info-%DATE%.log',
  level: 'info',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: winston.format.combine(
    winston.format.timestamp({ format: tsFormat }),
    // Filter out error level logs from info file
    winston.format((info) => {
      return info.level === 'error' ? false : info;
    })(),
    productionFormat
  ),
});
```
* **Günün Tapşırığı:** Bütün gündəlik məlumat loqlarını `logs/info-YYYY-MM-DD.log` faylına yazmaq.
* **🔥 Kritik Filtr:** `winston.format((info) => (info.level === 'error' ? false : info))()` hissəsi **xətaların (error) `info.log` faylına düşməsinin qarşısını alır**. Beləliklə, info faylı yalnız normal əməliyyatları saxlayır!
* **Rotasiya Qaydaları:** Fayl 20MB dolduqda bölünür (`maxSize`), köhnələr sıxışdırılır (`zippedArchive`), 30 gündən köhnələr silinir (`maxFiles`).

#### 📍 Sətir 86 - 99: Yalnız Xətalar Faylı (`fileErrorTransport`)
```typescript
const fileErrorTransport = new winston.transports.DailyRotateFile({
  dirname: 'logs',
  filename: 'error-%DATE%.log',
  level: 'error',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '45d',
  format: winston.format.combine(
    winston.format.timestamp({ format: tsFormat }),
    productionFormat
  ),
});
```
* **Məntiqi:** Yalnız `level: 'error'` olan logları tutur və `logs/error-YYYY-MM-DD.log` faylına yazır. Xətalar kritik olduğu üçün 45 gün saxlanılır (`maxFiles: '45d'`).

#### 📍 Sətir 101 - 111: Əsas Konfiqurasiya Obyekti (`loggerConfig`)
```typescript
export const loggerConfig = {
  format: winston.format.combine(
    winston.format.timestamp({ format: tsFormat }),
    winston.format.errors({ stack: true })
  ),

  transports: [consoleTransport, fileInfoTransport, fileErrorTransport],

  exceptionHandlers: [fileErrorTransport],
  rejectionHandlers: [fileErrorTransport],
};
```
* **`exceptionHandlers` & `rejectionHandlers`:** Tutulmamış (uncaught) Node.js xətalarını və həll olunmamış Promise imtinalarını (`unhandledRejection`) avtomatik olaraq `fileErrorTransport`-a göndərərək fayla yazır.

---

### 📄 2.2. `logger.service.ts` — `AppLogger` Servisi

Bu fayl Winston loqqerini NestJS-in istifadə edə biləcəyi `NestLoggerService` standartına uyğunlaşdırır.

#### 📍 Sətir 5 - 16: Konstruktor Və İnjection
```typescript
@Injectable()
export class AppLogger implements NestLoggerService {
  private context?: string;
  private winstonLogger: Logger;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger | { logger: Logger }
  ) {
    this.winstonLogger = 'logger' in this.logger ? this.logger.logger : this.logger;
  }
```
* **Niyə `@Inject(WINSTON_MODULE_NEST_PROVIDER)`?** NestJS-in `nest-winston` paketi tərəfindən yaradılan Winston instansiyasını bu servisə daxil edir (Inject edir).
* **Niyə `'logger' in this.logger` yoxlanışı var?** `nest-winston` bəzən loqqeri birbaşa, bəzən də `{ logger: Logger }` obyekti şəklində bükülmüş (wrapped) verir. Bu kod hər iki halda əsl Winston `Logger` obyektini etibarlı şəkildə çıxardır.

#### 📍 Sətir 18 - 20: Kontekst Təyini (`setContext`)
```typescript
setContext(context: string) {
  this.context = context;
}
```
* Servisdə konteksti bir dəfə set edib (məsələn, `this.logger.setContext('AuthService')`), növbəti loglarda kontekst yazmaq məcburiyyətindən azad olursan.

#### 📍 Sətir 22 - 57: Standart NestJS Log Metodları (`log`, `error`, `warn`, `debug`, `verbose`)
```typescript
log(message: string, context?: string) {
  const ctx = context || this.context || 'Application';
  this.winstonLogger.info(message, { context: ctx });
}
```
* **Error Metodunun Xüsusiyyəti (Sətir 27-42):**
  ```typescript
  if (trace instanceof Error) {
    this.winstonLogger.error(message, {
      context: ctx,
      trace: trace.stack,
      error: {
        name: trace.name,
        message: trace.message,
      },
    });
  } else {
    this.winstonLogger.error(message, { context: ctx, trace });
  }
  ```
  Ötürülən `trace` parametrinin `Error` obyekti və ya adicə mətni (`string`) olmasını yoxlayır və xətanın stack trace-ini, adını və mesajını səliqəli şəkildə log obyektinə daxil edir.

#### 📍 Sətir 59 - 76: Əlavə Metadata Metodları (`logWithMetadata`, `errorWithMetadata`)
```typescript
logWithMetadata(message: string, metadata: Record<string, unknown>, context?: string) {
  const ctx = context || this.context || 'Application';
  this.winstonLogger.info(message, { context: ctx, ...metadata });
}

errorWithMetadata(message: string, error: Error, metadata?: Record<string, unknown>, context?: string) {
  const ctx = context || this.context || 'Application';
  this.winstonLogger.error(message, {
    context: ctx,
    trace: error.stack,
    error: {
      name: error.name,
      message: error.message,
    },
    ...metadata,
  });
}
```
* **Məqsəd:** İstifadəçi ID-si, IP ünvanı, HTTP status kodu kimi əlavə obyektləri log ilə birlikdə göndərmək üçün xüsusi metodlar.

---

### 📄 2.3. `logger.module.ts` — NestJS Qlobal Modulu

```typescript
import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './logger.config';
import { AppLogger } from './logger.service';

@Global()
@Module({
  imports: [WinstonModule.forRoot(loggerConfig)],
  providers: [AppLogger],
  exports: [AppLogger, WinstonModule],
})
export class LoggerModule {}
```

#### 💡 Müəllim İzahı:
1. **`@Global()` Dekoratoru:** Bu modulu proyektin istənilən yerindən əlçatan edir. Yəni başqa modullarda (örnək: `UsersModule`, `AuthModule`) təkrar-təkrar `imports: [LoggerModule]` yazmağa ehtiyac qalmır!
2. **`WinstonModule.forRoot(loggerConfig)`:** Bizim `logger.config.ts`-də yazdığımız qaydaları `nest-winston` modula yükləyir.
3. **`exports: [AppLogger, WinstonModule]`:** `AppLogger` servisini və Winston modulu digər NestJS komponentlərinə istifadə üçün təqdim edir.

---

## 🛠️ 3. Layihədə İstifadə Qaydası (Praktiki Nümunə)

İstənilən Servis və ya Kontroller daxilində `AppLogger`-ı belə istifadə edə bilərsən:

```typescript
import { Injectable } from '@nestjs/common';
import { AppLogger } from './logger.service';

@Injectable()
export class UserService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('UserService');
  }

  async createUser(userData: any) {
    this.logger.log(`İstifadəçi yaradılır: ${userData.email}`);

    try {
      // ... istifadəçi yaratmaq məntiqi
      this.logger.logWithMetadata('İstifadəçi uğurla yaradıldı', { userId: '123' });
    } catch (err: any) {
      this.logger.errorWithMetadata('İstifadəçi yaradılarkən xəta baş verdi', err, { userData });
    }
  }
}
```

---

## 🎯 4. Müəllimdən Xülasə Qeydlər

| Fayl | Əsas Vəzifəsi | Ən Mühüm Məqam |
| :--- | :--- | :--- |
| [`logger.config.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/logger/src/lib/logger.config.ts) | Qaydalar & Konfiqurasiya | Xətalar `error.log`-a gedir, `info.log`-dan isə filtr vasitəsilə kəsilir. |
| [`logger.service.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/logger/src/lib/logger.service.ts) | Log Metodları (`AppLogger`) | Metadata və `Error` obyektlərini avtomatik tutub JSON-laşdırır. |
| [`logger.module.ts`](file:///c:/Users/User/Desktop/nest_js_projects/1_poster_parlor/new-poster-parlor-api/libs/logger/src/lib/logger.module.ts) | Modul Qeydiyyatı | `@Global()` sayəsində bütün proyektə 1 dəfəyə yayılır. |

Qaranlıq qalan hər hansı sətir və ya məntiq olarsa, cəsarətlə soruşa bilərsən! 🚀

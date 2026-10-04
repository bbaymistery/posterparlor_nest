# 🚀 API Main Application Architecture & Global Setup (`apps/api/README.md`)

Bu sənəd `apps/api/src/main.ts` faylında icra olunan **Qlobal Ayarları (Global Setup)** və bunun tətbiqin təhlükəsizliyinə təsirini izah edir.

---

## 🏛️ `main.ts` Daxilindəki Əsas Qlobal Yeniliklər

```typescript
// 1. Cookie Parser (HttpOnly Cookie-ləri oxumaq üçün)
app.use(cookieParser());

// 2. Dinamik CORS Konfiqurasiyası
app.enableCors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Mobile tətbiqlər / Postman üçün
    if (config.appConfig.allowedOrigin.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
});

// 3. Qlobal JwtAuthGuard
const reflector = app.get(Reflector);
app.useGlobalGuards(new JwtAuthGuard(reflector));
```

---

## 🛡️ Qlobal Guard (`app.useGlobalGuards`) Nə Deyəkdir?

Əvvəllər hər bir Controller və ya Route-un üstünə tək-tək `@UseGuards(JwtAuthGuard)` yazmaq məcburiyyətində idik.

İndi `main.ts` daxilində **`app.useGlobalGuards(new JwtAuthGuard(reflector))`** yazaraq `JwtAuthGuard`-ı **Qlobal (Bütün tətbiq üzrə)** elan etdik.

### ⚠️ Bunun Tətbiqə Təsiri:
1. **Susmaya Görə Qorunan (Protected by Default)**: Tətbiqdəki BÜTÜN route-lar avtomatik olaraq JWT autentifikasiyası tələb edir! İstifadəçi login olmadan istənilən route-a girərsə **401 Unauthorized** alacaq.
2. **Açıq Marşrutlar Üçün `@Public()`**: Əgər bir marşrutun (məsələn: Login, Register, DB Health Check) hər kəs üçün açıq olmasını istəyiriksə, həmin metodun üstünə **`@Public()`** dekoratorunu vurmalıyıq.

---

## 🌐 Nümunələr:

### 🟢 1. Database Health Check (`DatabaseController`)
```typescript
@Controller('db-health')
export class DatabaseController {
  @Get()
  @Public() // 👈 JwtAuthGuard qlobal olduğu üçün bu marşrutu hər kəsə açıq etmək üçün @Public() vurduq!
  async healthCheck() {
    return this.databaseHealthService.checkHealth();
  }
}
```

### 🔴 2. Qorunan Qlobal Controller (`AppController`)
```typescript
@Controller()
export class AppController {
  @Get()
  // 👈 @Public() YOXDUR! JwtAuthGuard qlobal olduğu üçün bu marşrut avtomatik LOGIN tələb edir.
  getData() {
    return this.appService.getData();
  }
}
```

---

## 🌐 Dinamik CORS Konfiqurasiyası (`enableCors`)

* **`credentials: true`**: Frontend-dən backend-ə `HttpOnly` cookie-lərin göndərilməsinə icazə verir.
* **`origin` funksiyası**: `.env` faylındakı `ALLOWED_ORIGINS` (`http://localhost:3000,http://localhost:4200`) siyahısındakı domenlərə icazə verir.
* **`if (!origin)`**: Postman və ya Mobile tətbiqlər HTTP Origin header-i göndərmədiyi üçün onların da istək atmasına şərait yaradır.

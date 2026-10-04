# 📜 Nx Monorepo İcra Olunan Əmrlər Və Addımlar Tarixçəsi (Command History Log)

Bu sənəddə **`new-poster-parlor-api`** monorepo layihəsində icra etdiyimiz bütün terminal əmrləri, onların məqsədi və hansı faylları yaratdığı addım-addım qeyd olunur.

---

## 📌 Addım 1: Monorepo Layihəsinin Yaradılması

* **İcra Olunan Əmr:**
  ```sh
  npx create-nx-workspace@latest new-poster-parlor-api --preset=@nx/nest --appName=api
  ```
* **Niyə İcra Etdik? (Məqsədi):**
  * Nx Monorepo arxitekturasını qurmaq üçün.
  * `apps/api` daxilində əsas NestJS Backend layihəmizi və onun yanına `apps/api-e2e` avtomatik test layihəsini yerləşdirmək üçün.
* **Nəticədə Nələr Yarandı?**
  * `apps/api/` — Əsas NestJS Backend API-si (Port 3000).
  * `apps/api-e2e/` — Backend endpoint-lərini avtomatik test edən E2E layihəsi.
  * `nx.json`, `tsconfig.base.json`, `package.json` — Monorepo tənzimləmə faylları.

---

## 📌 Addım 2: Ortaq Auth Kitabxanasının (Library) Yaradılması

* **İcra Olunan Əmr:**
  ```sh
  npx nx g @nx/nest:lib libs/auth
  ```
* **Niyə İcra Etdik? (Məqsədi):**
  * Autentifikasiya (JWT, Login, Register, Guards) kodlarını əsas `api` tətbiqindən ayıraraq təkrar istifadə oluna bilən ortaq **Library (Kitabxana)** kimi təcrid etmək üçün.
* **Nəticədə Nələr Yarandı?**
  * `libs/auth/src/lib/auth.module.ts` — Authentication modulu.
  * `libs/auth/src/index.ts` — Kitabxananın export nöqtəsi.

---

## 📌 Addım 3: Ortaq Database Kitabxanasının (Library) Yaradılması

* **İcra Olunan Əmr:**
  ```sh
  npx nx g @nx/nest:lib libs/database
  ```
* **Niyə İcra Etdik? (Məqsədi):**
  * Verilənlər bazası bağlantısını (TypeORM / PostgreSQL) müstəqil **Database Library** kimi təcrid etmək üçün.
* **Nəticədə Nələr Yarandı?**
  * `libs/database/src/lib/database.module.ts` — Database modulu.

---

## 📌 Addım 4-11: Qalan Kitabxanaların (Libs) Yaradılması

* **İcra Olunan Əmrlər:**
  ```sh
  npx nx g @nx/nest:lib libs/utils
  npx nx g @nx/nest:lib libs/inventory
  npx nx g @nx/nest:lib libs/order
  npx nx g @nx/nest:lib libs/models
  npx nx g @nx/nest:lib libs/config
  npx nx g @nx/nest:lib libs/logger
  npx nx g @nx/nest:lib libs/admin
  npx nx g @nx/nest:lib libs/shared
  ```
* **Niyə İcra Etdik? (Məqsədi):**
  * Modulyar Monorepo arxitekturasına uyğun olaraq anbar, sifarişlər, daxili modellər, loqlama və inzibatçı paneli kodlarını təcrid olunmuş müstəqil kitabxanalara bölmək üçün.

---

## 📌 Addım 12: `package.json` Skriptlərinin Əlavə Edilməsi

* **Qoşulan Skriptlər (`package.json`):**
  ```json
  "scripts": {
    "dev": "npx nx run api:serve:development --no-inspect",
    "start": "npx nx run api:serve:production --no-inspect",
    "build": "npx nx build api",
    "lint": "npx nx lint api",
    "clear": "npx nx reset && rm -rf dist node_modules && npm install"
  }
  ```
* **Niyə İcra Etdik? (Məqsədi):**
  * Terminalda uzun-uzadı `npx nx run api:serve:development` yazmaq əvəzinə `npm run dev` yazaraq layihəni anında başlatmaq üçün.

---

## 📌 Addım 13: Enterprise Logger Kitabxanasının (`libs/logger`) Quraşdırılması Və İnteqrasiyası

* **Qoşulan Paketlər:**
  ```sh
  npm install winston winston-daily-rotate-file nest-winston
  ```
* **İcra Olunan İşlər:**
  * `libs/logger/src/lib/logger.config.ts` faylında Winston Daily Rotate File transport-ları (`info-%DATE%.log`, `error-%DATE%.log`) və xüsusi vaxt formatı (`tsFormat`) quruldu.
  * `libs/logger/src/lib/logger.service.ts` daxilində NestJS `NestLoggerService` interfeysini realizə edən `AppLogger` servisi yazıldı.
  * `libs/logger/src/lib/logger.module.ts` `@Global()` dekoratoru ilə qlobal modul edildi.
  * `apps/api/src/app/app.module.ts`-ə `LoggerModule` daxil edildi və `main.ts`-də `app.useLogger(logger)` ilə NestJS-in standart loqqeri `AppLogger` ilə əvəzləndi.
* **Niyə İcra Etdik? (Məqsədi):**
  * Serverdə baş verən bütün log-ları terminalda gözəl rəngli görmək, xətaları və məlumatları gündəlik olaraq `logs/` papkasına avtomatik arxivlənən fayllara yazmaq üçün.

---

## 📌 Addım 14: Mühit Dəyişənləri Və Config Kitabxanasının (`libs/config`) Quraşdırılması

* **Düzəliş Edilən Paketlər:**
  ```sh
  npm install @nestjs/config@^4.0.0 class-validator class-transformer
  ```
* **İcra Olunan İşlər:**
  * Node.js `ERR_REQUIRE_ESM` xətasını həll etmək üçün `@nestjs/config` paketi CommonJS dəstəkləyən sabit v4.0.0 versiyasına endirildi.
  * `libs/config/src/lib/config.validation.ts` daxilində `class-validator` ilə sərt yoxlama qaydaları yazıldı (əskik parametr olduqda `process.exit(1)` ilə server dayandırılır).
  * `libs/config/src/lib/config.service.ts` daxilində `appConfig`, `dbConfig`, `authConfig` kimi tip güvənli getter-lər və `7d` -> ms vaxt çeviricisi yazıldı.
  * `libs/config/src/lib/config.module.ts` `@Global()` edildi və `NODE_ENV`-ə görə `development.env` və ya `production.env` oxunması təmin edildi.
  * `apps/api/src/app/app.module.ts`-ə `AppConfigModule` daxil edildi və `main.ts`-də port `config.appConfig.port` üzərindən oxundu.
* **Niyə İcra Etdik? (Məqsədi):**
  * Tətbiq işə düşməzdən əvvəl `.env` faylındakı bütün parametrlərin mövcudluğunu və doğruluğunu yoxlamaq, xətalı parametr olarsa runtime crash-ın qarşısını almaq üçün.

---

*(Növbəti icra ediləcək hər bir əmr bura avtomatik əlavə olunacaq...)*


# 🩺 Database Health Checker & Heartbeat Monitor (`libs/database/src/lib/health`)

Bu qovluqda yerləşən fayllar verilənlər bazasının canlı işlək vəziyyətdə (Healthy) olub-olmadığını, sorğuların gecikmə vaxtını (Latency ms) və MongoDB serverinin versiyasını dinamik izləmək üçün yazılıb.

---

## 📁 Qovluğun Tərkibi

1. **`health.checker.ts`** — Bazaya birbaşa pinq (ping) atan və metrikaları toplayan sinif (`DatabaseHealthChecker`).
2. **`health.monitor.ts`** — Hər 30 saniyədən bir arxa fonda avtomatik yoxlama aparan taymer monitoru (`DatabaseHealthMonitor`).

---

## 🔬 Sətir-Sətir Müəllim İzahı

### 📄 1. `health.checker.ts` (`DatabaseHealthChecker`)

 Bu sinif bazanın fiziki qoşulmasını və latensiyasını ölçür:

```typescript
export class DatabaseHealthChecker {
  constructor(private readonly connection: Connection) { }

  async check(): Promise<DBHealthCheckResult> {
    const isConnected = this.connection.readyState === 1;

    let latency: number | undefined;
    let version: string | undefined;
    const errors: string[] = [];

    if (isConnected) {
      try {
        const pingSatrt = Date.now();
        const admin = this.connection.db?.admin();
        const info = await admin?.serverInfo();

        version = info?.['version'];
        latency = Date.now() - pingSatrt;
      } catch (error) {
        errors.push((error as Error).message);
      }
    }
```

#### 💡 Necə İşləyir?
1. **`this.connection.readyState === 1`**: Mongoose-da `1` kodu `connected` (qoşulub) deməkdir.
2. **Admin Server Info (`admin?.serverInfo()`)**: Bazaya sorğu göndərir. Bu sorğunun başladığı vaxt ilə bitdiyi vaxt arasındakı fərq **Latensiya (Gecikmə müddəti millisaniyə ilə)** adlanır.
3. **Versiya Təyini**: MongoDB serverinin dəqiq versiyasını (məs: `7.0.5`) cavabdan oxuyur.

#### 📊 Statusun Müəyyən Edilməsi (`resolveStatus`):
* `healthy`: Baza qoşulub və gecikmə 1000ms-dən azdır.
* `degraded`: Baza qoşulub, amma sorğu 1 saniyədən yavaş cavab verir və ya xəbərdarlıq var.
* `unhealthy`: Baza qoşulmayıb (`readyState !== 1`).

---

### 📄 2. `health.monitor.ts` (`DatabaseHealthMonitor`)

Bu sinif baza sağlamlığını **arxa fonda (background heartbeat)** təkrar-təkrar yoxlayan monitor sistemidir.

```typescript
export class DatabaseHealthMonitor {
  private timer?: NodeJS.Timeout;
  private checker: DatabaseHealthChecker;
  private last?: DBHealthCheckResult;
  private failure = 0;
  private readonly MAX = 3;
  private readonly interval: number;

  constructor(checker: DatabaseHealthChecker, ms = 10000) {
    this.checker = checker;
    this.interval = ms;
  }

  start() {
    if (!this.timer) {
      this.timer = setInterval(() => this.check(), this.interval);
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
```

#### 💡 Niyə Bu Monitor Lazımdır?
* **Arxa Fon Taymeri (`setInterval`)**: Hər 30 saniyədən bir avtomatik `this.check()` funksiyasını çağırır.
* **Keşləmə (`getLast()`)**: İstifadəçi hər dəfə `/api/db-health` endpoint-inə istək atdıqda bazanı təkrar-təkrar yormamaq üçün sonuncu yoxlamanın cavabını (`this.last`) yaddaşdan verir.
* **Ardıcıl Xəta Sayğacı (`this.failure >= 3`)**: Əgər baza üst-üstə 3 dəfə xəta verərsə, sistem xəbərdarlıq qeydini jurnalına yazır.

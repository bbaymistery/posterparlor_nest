# 📦 package.json Skriptləri Və Terminal Məntiqi (Scripts Guide)

Bu sənəddə **`package.json`** faylına əlavə etdiyimiz skriptlərin mənaları, terminalda görünən proseslər və qarşılaşdığın `nx command not found` xətasının tam izahı verilir.

---

## ⚙️ 1. Əlavə Etdiyimiz Skriptlər Və Mənaları

`package.json`-dakı `"scripts"` bloqu uzun terminal əmrlərini qısaltmaq üçün istifadə olunur:

```json
"scripts": {
  "dev": "npx nx run api:serve:development --no-inspect",
  "start": "npx nx run api:serve:production --no-inspect",
  "build": "npx nx build api",
  "lint": "npx nx lint api",
  "clear": "npx nx reset && rm -rf dist node_modules && npm install"
}
```

### 🔹 1. `npm run dev`
* **Əmr:** `npx nx run api:serve:development --no-inspect`
* **Mənası:** Layihəni **Development (tərtibat)** rejimində işə salır. Kodda hər hansı faylı dəyişib yadda saxladıqda (CTRL+S), server avtomatik özünü yeniləyir (Hot Reload / Watch Mode).
* **`--no-inspect` nədir?** Node.js-in V8 Debugger portunu bağlayır. Bu layihənin daha tez işə düşməsinə və port toqquşmasının önlənməsinə kömək edir.

### 🔹 2. `npm run start`
* **Əmr:** `npx nx run api:serve:production --no-inspect`
* **Mənası:** Layihəni **Production (İstehsalat)** rejimində sürətli və optimallaşdırılmış şəkildə işə salır.

### 🔹 3. `npm run build`
* **Əmr:** `npx nx build api`
* **Mənası:** TypeScript kodlarını `dist/apps/api` qovluğuna təmiz JavaScript faylları kimi kompilyasiya edir.

### 🔹 4. `npm run lint`
* **Əmr:** `npx nx lint api`
* **Mənası:** ESLint ilə kodda sintaksis və stil səhvlərinin olub-olmadığını yoxlayır.

### 🔹 5. `npm run clear`
* **Əmr:** `npx nx reset && rm -rf dist node_modules && npm install`
* **Mənasi:** Layihədə keçlər (cache) və ya `node_modules` zədələndikdə bütün keşləri sıfırlayır, `dist` və `node_modules`-u silib yenidən `npm install` edir (Layihəni təmizləyib yenidən dirildir).

---

## 🖥️ 2. Terminalda Niyə `api:build` Sonra `api:serve` Görünür?

Terminalda `npm run dev` qaçıranda ekran iki yerə bölünür:
```text
api:serve:development Continuous
api:build:development ...  (Not started yet, waiting for 1 / 1 tasks to complete)
```

### 💡 Məntiqi Nədir?
NestJS serverinin işə düşməsi (`serve`) üçün əvvəlcə TypeScript kodlarının JavaScript-ə çevrilməsi (`build`) vacibdir.
Nx ağıllı dependency graph-a malikdir: 
1. **İlkin Mərhələ (`build`):** Əvvəlcə `api:build:development` işləyir və kodu kompilyasiya edir.
2. **İkinci Mərhələ (`serve`):** Kompilyasiya bitən kimi `api:serve:development` avtomatik işə düşür və 3000 portunda HTTP serveri açır!

---

## ❓ 3. Niyə `nx run api:serve` Yazanda Windows-da Xəta Aldın?

### ❌ Sənin Alınan Xətan:
```text
nx : The term 'nx' is not recognized as the name of a cmdlet, function...
```

### 💡 Niyə Baş Verdi?
Çünki `nx` CLI aləti sənin Windows əməliyyat sistemində **Qlobal (Global)** olaraq yüklənməyib. 

### ✅ Həll Yolu:
Əgər `nx` qlobal yüklənməyibsə, terminalda yalnız 2 yolla işlədə bilərsən:
1. Önünə **`npx`** əlavə etməklə:  
   `npx nx run api:serve:development`
2. Və ya `package.json`-a qısayol əlavə etdiyimiz üçün sadəcə:  
   `npm run dev`

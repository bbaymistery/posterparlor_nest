# 🚀 Poster Parlor API (Nx Monorepo Layihəsi)

Bura **Nx Monorepo** arxitekturası ilə yaradılmış NestJS tətbiqidir!

---

## ❓ 1. Nx Monorepo Nədir və Biz Nə Etdik?

**Nx** — böyük və ya kiçik layihələri bir yerdə, nizamlı şəkildə idarə etmək üçün Node.js dünyasının **ən güclü Monorepo alətidir**.

### 💡 Monorepo Nə Deməkdir?
Əvvəllər hər bir tətbiq (Backend, Frontend, Admin Panel, E2E Testlər) üçün ayrı-ayrı Git reposu və ayrı `node_modules` saxlayırdıq. 
**Monorepo** yanaşmasında isə **bütün layihələr 1 böyük qovluq daxilində (`apps/` və `libs/`) toplanır**, amma hamısı ortaq `package.json` və `node_modules` paylaşıb ultra-sürətli işləyir!

---

## 📁 2. Bu Layihəyə `api` və `api-e2e` Haradan Gəldi?

Biz `create-nx-workspace` işlədəndə və `@nx/nest` generatorunu seçəndə, Nx bizim üçün avtomatik **2 əsas tətbiq (Application)** yaratdı:

1. **`apps/api/`** ➡️ **Bizim Əsas NestJS Backend API-miz:**
   * `apps/api/src/main.ts` — Backend-in giriş nöqtəsi (Port 3000).
   * `apps/api/src/app/app.module.ts` — Əsas NestJS modulu.
   * `apps/api/Dockerfile` — Serverə deploy etmək üçün Docker container faylı.

2. **`apps/api-e2e/`** ➡️ **End-to-End (E2E) Avtomatik Test Layihəsi:**
   * Backend API işə düşəndə, onun endpoint-lərini real sorğularla test edən avtomatlaşdırılmış Jest test layihəsidir.
   * Çünki real istehsalatda API yazdıqdan sonra onun düzgün işlədiyini saniyələr içində test etmək üçün E2E layihəsi yanına qoşulur.

---

## ⚡ 3. Tez-Tez İşlədilən Nx Əmrləri

### 🟢 Backend Tətbiqini İşə Salmaq (Dev Mode):
```sh
npx nx serve api
```

### 🔨 Proyekti Build (İstehsalat Paketinə) Etmək:
```sh
npx nx build api
```

### 🧪 E2E Testləri Qaçırmaq:
```sh
npx nx e2e api-e2e
```

### 🎨 Layihənin Vizual Qrafik Xəritəsini Görmək:
```sh
npx nx graph
```

---

## ➕ 4. Yeni Modul və ya Library Əlavə Etmək

Nx ilə monorepo daxilində yeni ortaq kitabxana (library) yaratmaq üçün:
```sh
npx nx g @nx/nest:lib shared-utils
```

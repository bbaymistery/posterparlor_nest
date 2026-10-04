# 🧰 Utility Helpers Və Parsers (`libs/utils/src/lib`)

Bu qovluqda tətbiq daxilində tez-tez istifadə olunan **xüsusi HTTP exception-lar, cavab yardımçıları (Response Utilities) və stack trace parser-ləri** yerləşir.

---

## 📁 Faylların Tərkibi Və Müəllim İzahı

### 📄 1. `http-exception.ts` (Custom Exceptions)
* Standard NestJS `HttpException` klassını genişləndirir.
* Xüsusi xəta sinifləri təqdim edir:
  - `CustomHttpException`
  - `ValidationException` (`422 Unprocessable Entity`)
  - `NotFoundCustomException` (`404 Not Found`)
  - `UnauthorizedCustomException` (`401 Unauthorized`)
  - `ForbiddenCustomException` (`403 Forbidden`)

---

### 📄 2. `http-response.ts` (`HttpResponseUtil`)
* Statik metodlar təqdim edən köməkçi sinif:
  - `HttpResponseUtil.success(data, message)`
  - `HttpResponseUtil.created(data, message)`
  - `HttpResponseUtil.updated(data, message)`
  - `HttpResponseUtil.deleted(message)`

---

### 📄 3. `stack-trace-parser.ts` (`parseStackTrace`)
* **Nə iş görür?** JavaScript `Error.stack` mətnini analiz edərək xətanın tam olaraq **hansı faylda, hansı sətirdə və sütunda** baş verdiyini təmiz `StackFrame[]` massivi şəklində çıxarır.
* Yalnız `NODE_ENV === 'development'` rejimində işləyir ki, tərtibatçı xətanın harada olduğunu konsolda dərhal görə bilsin.

---

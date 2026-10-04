import { Module } from '@nestjs/common';

/**
 * 📦 UTILS MODULE (NestJS Şablon Modulu)
 * 
 * `libs/utils` kitabxanasındakı Interceptor və Filter-lər class/function olaraq
 * birbaşa `main.ts`-də istifadə olunduğu üçün bu modul təmiz saxlanılır.
 */
@Module({
  controllers: [],
  providers: [],
  exports: [],
})
export class PosterParlorApiUtilsModule {}


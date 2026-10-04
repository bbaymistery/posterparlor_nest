import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from '@new-poster-parlor-api/models';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { CloudinaryService } from '@new-poster-parlor-api/inventory';

/**
 * 📦 REVIEW MODULE (Rəy & Qiymətləndirmə Modulu)
 * 
 * Müəllim izahı:
 * Bu modul istifadəçilərin posterlərə rəy (review) yazmasını, ulduz (rating) verməsini,
 * rəyə şəkillər əlavə etməsini, rəyləri filtrləməsini və silməsini idarə edən modul konfiqurasiyasıdır.
 */
@Module({
  imports: [
    // 1. MongooseModule.forFeature: MongoDB-də 'reviews' kolleksiyası ilə işləyə bilmək üçün
    // Review modelini və ReviewSchema-nı bu modula tanıdırıq.
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  // 2. controllers: Xarici HTTP istəklərini (GET, POST, PUT, DELETE) qarşılayan controller
  controllers: [ReviewController],
  
  // 3. providers: Biznes loqikasını yerinə yetirən ReviewService və şəkilləri yaddaşa vurmaq üçün CloudinaryService
  providers: [ReviewService, CloudinaryService],
  
  // 4. exports: Başqa modullar (məsələn AppModule) ReviewService-dən istifadə edə bilsin deyə export olunur
  exports: [ReviewService],
})
export class ReviewModule { }

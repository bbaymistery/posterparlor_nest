import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFiles, UseInterceptors, } from '@nestjs/common';
import { ReviewService } from './review.service';
import { Auth, CurrentUser, Public } from '@new-poster-parlor-api/auth';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FileStructure } from '@new-poster-parlor-api/shared';
import type { AuthenticatedUser } from '@new-poster-parlor-api/shared';
import { createReviewDto, UserRole } from '@new-poster-parlor-api/models';
import { HttpResponseUtil } from '@new-poster-parlor-api/utils';

/**
 * 🎮 REVIEW CONTROLLER (Rəy Marşrutları Giriş Qapısı)
 * 
 * Müəllim izahı:
 * Controller-in əsas işi frontend-dən (Postman-dan) gələn HTTP istəklərini (POST, PUT, GET, DELETE)
 * qarşılamaq, təhlükəsizlik guard-larından keçirmək, faylları Interceptor ilə tutub
 * bütün loqikanı işləmək üçün ReviewService-ə ötürməkdir!
 * 
 * Bütün marşrutlar `/api/review` prefiksi altında işləyir.
 */
@Controller('review')
export class ReviewController {
  // Dependency Injection: ReviewService-i avtomatik bura daxil edirik
  constructor(private readonly reviewService: ReviewService) { }

  /**
   * -----------------------------------------------------------------------
   * 1️⃣ POST /api/review/:id -> YENİ RƏY YARATMAQ (CREATE REVIEW)
   * -----------------------------------------------------------------------
   * 🔐 `@Auth()`: Yalnız sistemə daxil olmuş (JWT token sahibi) istifadəçilər rəy yaza bilər.
   * 📸 `@UseInterceptors(FileFieldsInterceptor(...))`: 'images' sahəsində maksimum 5 şəkil qəbul edir.
   * 📌 `:id` - Rəy yazılan Poster-in MongoDB `_id`-sidir.
   */
  @Post(':id')
  @Auth()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async createReview(
    @Param('id') id: string, // URL-dən gələn poster id-si
    @UploadedFiles() files: { images?: FileStructure[] }, // Qəbul edilən şəkillər
    @Body() reviewDetails: createReviewDto, // Request Body-dən gələn rəy məlumatları (comment, rating)
    @CurrentUser() user: AuthenticatedUser // Token-dən avtomatik çıxarılan daxil olmuş istifadəçi
  ) {
    const newImage = files?.images || [];
    const userId = user.id;
    const posterId = id;

    // Service-ə göndərib nəticəni qaytarırıq
    const review = await this.reviewService.createReview(
      reviewDetails,
      newImage,
      userId,
      posterId
    );

    return review;
  }

  /**
   * -----------------------------------------------------------------------
   * 2️⃣ PUT /api/review/:id -> RƏYİ YENİLƏMƏK (UPDATE REVIEW)
   * -----------------------------------------------------------------------
   * 🔐 `@Auth()`: İstifadəçi daxil olmalıdır. (Həmçinin yalnız öz rəyini və ya Admin yeniləyə bilər).
   * 📸 `@UseInterceptors(FileFieldsInterceptor(...))`: Yeni yüklənən şəkilləri qəbul edir.
   * 📌 `:id` - Yenilənəcək Rəyin (Review) MongoDB `_id`-sidir.
   */
  @Put(':id')
  @Auth()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async updateReview(
    @Param('id') id: string, // URL-dən gələn review id-si
    @UploadedFiles() files: { images?: FileStructure[] }, // Yeni gələn şəkil faylları
    @Body() reviewDetails: createReviewDto, // Yenilənəcək məlumatlar (şəkil silmə rejimi, rəy mətni, rating)
    @CurrentUser() user: AuthenticatedUser // Daxil olmuş istifadəçi məlumatları
  ) {
    const userId = user.id;
    const role = user.role;
    const newImages = files?.images || [];

    const updateReview = await this.reviewService.updateReview(
      id,
      role,
      reviewDetails,
      userId,
      newImages
    );
    return updateReview;
  }

  /**
   * -----------------------------------------------------------------------
   * 3️⃣ GET /api/review/:id -> POSTERİN RƏYLƏRİNİ GETİRMƏK (GET PRODUCT REVIEWS)
   * -----------------------------------------------------------------------
   * 🔓 `@Public()`: Bu endpoint hər kəs üçün açıqdır (qeydiyyatdan keçməyə ehtiyac yoxdur).
   * 📌 `:id` - Rəyləri gətiriləcək Poster-in MongoDB `_id`-sidir.
   * 🔍 Query Parametrləri:
   *    - `page`: Səhifə nömrəsi (default: 1)
   *    - `limit`: Hər səhifədə rəy sayı (default: 10)
   *    - `sort`: Çeşidləmə ('newest', 'oldest', 'highest', 'lowest')
   *    - `rating`: Müəyyən ulduza görə filtrləmə (1-5)
   *    - `hasImage`: Yalnız şəkilli rəyləri gətir ('true')
   */
  @Get(':id')
  @Public()
  async getProductReview(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort = 'newest',
    @Query('rating') rating: number,
    @Query('hasImage') hasImage?: string
  ) {
    const review = await this.reviewService.getProductReview(
      id,
      page,
      limit,
      sort,
      rating,
      hasImage === 'true'
    );

    return review;
  }

  /**
   * -----------------------------------------------------------------------
   * 4️⃣ DELETE /api/review/:id -> RƏYİ SİLMƏK (DELETE REVIEW)
   * -----------------------------------------------------------------------
   * 🔐 `@Auth(UserRole.ADMIN)`: Rəyləri silmək hüququ yalnız ADMIN roluna malik istifadəçiyə (və ya öz rəyidirsə rəyin sahibinə) verilir.
   * 📌 `:id` - Silinəcək rəyin MongoDB `_id`-sidir.
   */
  @Delete(':id')
  @Auth(UserRole.ADMIN)
  async deleteReview(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    await this.reviewService.deleteReview(id, user.id, user.role);

    // Standardized HTTP 200/204 cavab utilitimiz vasitəsilə uğurlu cavab qaytarırıq
    return HttpResponseUtil.deleted('Review deleted Successfully');
  }
}

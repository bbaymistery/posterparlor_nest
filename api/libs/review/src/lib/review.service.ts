import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CloudinaryService } from '@new-poster-parlor-api/inventory';
import { ReviewDocument, Review, createReviewDto, ReviewImage, updateReviewDto, UserRole, } from '@new-poster-parlor-api/models';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { FileStructure } from '@new-poster-parlor-api/shared';
import { BadRequestException, ConflictException, CustomHttpException, ForbiddenException, NotFoundException, ValidationException, } from '@new-poster-parlor-api/utils';
import { UploadApiResponse } from 'cloudinary';

/**
 * 🛠️ REVIEW SERVICE (Rəy & Qiymətləndirmə Biznes Loqikası)
 * 
 * Müəllim izahı:
 * Bu servis bütün rəy əməliyyatlarının beynidir! Şəkilləri Cloudinary bulud servisinə yükləyir,
 * rəyləri MongoDB bazasında saxlayır, təkrar rəy yazılmasının qarşısını alır, rəyləri filtrləyir,
 * ulduz statistikasını (1..5 paylanması və orta qiyməti) hesablayır və silmə əməliyyatlarında şəkilləri də buluddan təmizləyir.
 */
@Injectable()
export class ReviewService {
  constructor(
    // 1. Buluda şəkillər yükləmək və silmək üçün Cloudinary servisini daxil edirik
    private readonly cloudinaryService: CloudinaryService,
    // 2. MongoDB-də 'reviews' kolleksiyası ilə sorğu etmək üçün Mongoose Model-i inject edirik
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>
  ) { }

  /**
   * =======================================================================
   * 1️⃣ CREATE REVIEW (YENİ RƏY YARATMAQ)
   * =======================================================================
   * Addım 1: ID-lərin (userId, posterId) mövcudluğunu və MongoDB formatını yoxlayır.
   * Addım 2: Həmin istifadəçinin bu posterə artıq rəy yazıb-yazmadığını yoxlayır (Biri 1 rəy yaza bilər!).
   * Addım 3: Əgər şəkillər göndərilibsə, paralel olaraq Cloudinary-yə yükləyir.
   * Addım 4: MongoDB-də rəy sənədini (Review document) yaradır və yaddaşa yazır.
   * Addım 5: Əgər baza əməliyyatında xəta baş verərsə, yüklənmiş şəkilləri Cloudinary-dən silir (Rollback).
   */
  public async createReview(reviewDetails: createReviewDto, images: FileStructure[], userId: string, posterId: string) {
    // 1. Tələb olunan ID-lərin mövcudluq yoxlaması
    if (!userId || !posterId) {
      throw new NotFoundException('UserId and PosterId are required to create a review');
    }

    // 2. ObjectId formatının doğrulanması (24 simvollu hex string)
    if (!this.isValidObjectId(userId) || !this.isValidObjectId(posterId)) {
      throw new BadRequestException('Invalid UserId and PosterId format');
    }

    // 3. Təkrar rəy yoxlaması: Eyni istifadəçi eyni posterə 2-ci dəfə rəy yaza bilməz!
    const existingReview = await this.reviewModel.findOne({
      userId: userId,
      posterId: posterId,
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this poster. You can only submit one review per poster');
    }

    let uploadResults: UploadApiResponse[] = [];

    try {
      // 4. Şəkilləri Cloudinary bulud serverinə yükləyirik
      if (images && images.length > 0) {
        uploadResults = await this.cloudinaryService.uploadMultipleImages(images);
      }

      // 5. Cloudinary-dən gələn URL və public_id-ləri ReviewImage obyektlərinə çeviririk
      const imageUploadResults: ReviewImage[] = uploadResults.map((res) => ({
        url: res.secure_url,
        public_id: res.public_id,
        format: res.format,
        width: res.width,
        height: res.height,
      }));

      // 6. Yeni Mongoose rəy sənədini tərtib edirik
      const newReview = new this.reviewModel({
        userId,
        posterId,
        ...reviewDetails,
        images: imageUploadResults,
      });

      // 7. MongoDB bazasına saxlayırıq
      return await newReview.save();
    } catch (error) {
      // 🚨 ROLLBACK: Xəta baş verərsə, az əvvəl Cloudinary-yə yüklənmiş şəkilləri silirik!
      if (uploadResults.length > 0) {
        await this.cloudinaryService.deleteMultipleImages(uploadResults.map((res) => res.public_id));
      }

      throw new CustomHttpException("Failed to create review", 500, "REVIEW_CREATION_ERROR", error);
    }
  }

  /**
   * =======================================================================
   * 2️⃣ UPDATE REVIEW (RƏYİ YENİLƏMƏK)
   * =======================================================================
   * Addım 1: Rəyin varlığını və yeniləmək istəyən şəxsin rəyin sahibi (və ya Admin) olduğunu yoxlayır.
   * Addım 2: `imageAction` parametri üzrə şəkil loqikasını idarə edir:
   *          - 'replace': Bütün köhnə şəkilləri silir və təzələri ilə əvəzləyir.
   *          - 'keep' (default): Seçilmiş şəkilləri silir (`imagesToDelete`) və ya yenilərini əlavə edir.
   * Addım 3: Maksimum 5 şəkil məhdudiyyətini yoxlayır.
   * Addım 4: MongoDB-də rəyi yeniləyir və köhnə şəkilləri Cloudinary-dən paralel təmizləyir.
   */
  public async updateReview(reviewId: string, role: UserRole, reviewDetails: updateReviewDto, userId: string, images: FileStructure[]) {
    if (!userId || !reviewId) {
      throw new NotFoundException('UserId and ReviewId are required to update a review');
    }

    if (!this.isValidObjectId(userId) || !this.isValidObjectId(reviewId)) {
      throw new BadRequestException('Invalid UserId and ReviewId format');
    }

    // Rəyin bazada mövcudluğunu tapırıq
    const existingReview = await this.reviewModel.findById(reviewId);

    if (!existingReview) {
      throw new NotFoundException('Review Not Found');
    }

    // İcazə yoxlaması: Yalnız rəyin yazarı və ya ADMIN dəyişiklik edə bilər
    if (role !== UserRole.ADMIN && existingReview.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    let uploadResult: UploadApiResponse[] = [];
    let imagesToDeleteFromCloud: string[] = [];

    try {
      const existingImages = existingReview.images || [];
      let finalImages: ReviewImage[] = [];

      // Rejim A: Bütün şəkilləri tam əvəz etmək ('replace')
      if (reviewDetails.imageAction === 'replace') {
        if (existingImages.length > 0) {
          imagesToDeleteFromCloud = existingImages.map((img) => img.public_id);
        }

        if (images && images.length > 0) {
          uploadResult = await this.cloudinaryService.uploadMultipleImages(images);
          finalImages = uploadResult.map((res) => ({
            url: res.secure_url,
            public_id: res.public_id,
            format: res.format,
            width: res.width,
            height: res.height,
          }));
        }
      } else {
        // Rejim B: Mövcud şəkilləri saxlayaraq seçilmişləri silmək və ya yenilərini artırmaq
        finalImages = [...existingImages];

        if (reviewDetails.imagesToDelete && reviewDetails.imagesToDelete.length > 0) {
          const publicIdsToDelete = reviewDetails.imagesToDelete;
          imagesToDeleteFromCloud = publicIdsToDelete;

          finalImages = finalImages.filter((img) => !publicIdsToDelete.includes(img.public_id));
        }

        if (images && images.length > 0) {
          uploadResult = await this.cloudinaryService.uploadMultipleImages(images);

          const newReviewImages: ReviewImage[] = uploadResult.map((res) => ({
            url: res.secure_url,
            public_id: res.public_id,
            format: res.format,
            width: res.width,
            height: res.height,
          }));

          finalImages = [...finalImages, ...newReviewImages];
        }
      }

      // Maksimum 5 şəkil qaydası
      if (finalImages.length > 5) {
        throw new ValidationException('Max 5 images are allowed per review');
      }

      // Body-dən gələn şəkil idarəetmə parametrlərini ayırıb əsas rəy sahələrini güncəlləyirik
      const { imageAction, imagesToDelete, ...reviewFields } = reviewDetails;

      const updateReview: Partial<Review> = { ...reviewFields, images: finalImages };

      // MongoDB-də yeniləyirik
      const updatedData = await this.reviewModel.findByIdAndUpdate(
        reviewId,
        updateReview,
        { new: true }
      );

      // Uğurlu yeniləmədən sonra köhnə silinməli olan şəkilləri Cloudinary-dən silirik
      if (imagesToDeleteFromCloud.length > 0) {
        await this.cloudinaryService.deleteMultipleImages(imagesToDeleteFromCloud);
      }

      return updatedData;
    } catch (err) {
      // 🚨 ROLLBACK: Yeniləmə xətası verərsə, yeni yüklənmiş şəkilləri Cloudinary-dən təmizləyirik
      if (uploadResult.length > 0) {
        const uploadPublicIds = uploadResult.map((img) => img.public_id);
        await this.cloudinaryService.deleteMultipleImages(uploadPublicIds);
      }

      throw new CustomHttpException('Update Review Failed', 500, 'REVIEW_UPDATE_ERROR', err);
    }
  }

  /**
   * =======================================================================
   * 3️⃣ GET PRODUCT REVIEWS (POSTERİN RƏYLƏRİNİ VƏ STATİSTİKASINI GETİRMƏK)
   * =======================================================================
   * Addım 1: Səhifələmə (page, limit, skip) və Çeşidləmə (newest, oldest, highest, lowest) təyin edir.
   * Addım 2: Ulduz filtri (`rating`) və ya Şəkilli rəy filtri (`hasImages`) tətbiq edir.
   * Addım 3: `Promise.all` ilə parallel 3 sorğu icra edir:
   *          a) `find(filter)` + `populate('userId', 'name email')` -> Rəylərin siyahısı və istifadəçi adı.
   *          b) `countDocuments(filter)` -> Filtrlənmiş ümumi rəy sayısı.
   *          c) Mongoose `$aggregate` ($avg və $sum) -> Posterin orta balı və ümumi rəy sayı.
   * Addım 4: Mongoose `$aggregate` ilə 1, 2, 3, 4, 5 ulduzların say paylanmasını (ratingDistribution) hesablayır.
   */
  async getProductReview(posterId: string, page = 1, limit = 10, sort = 'newest', rating?: number, hasImages?: boolean) {
    if (!this.isValidObjectId(posterId)) {
      throw new BadRequestException('Invalid PosterId format');
    }

    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    const skip = (page - 1) * limit;

    const filter: FilterQuery<ReviewDocument> = { posterId };

    // Ulduz filtri (1-5)
    if (rating && rating >= 1 && rating <= 5) {
      filter.rating = rating;
    }

    // Yalnız şəkilli rəy filtri
    if (hasImages) {
      filter['images.0'] = { $exists: true };
    }

    // Çeşidləmə seçimləri
    let sortOption: any = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'highest':
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sortOption = { rating: 1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // 🚀 Paralel sorğu icrası (Sürətli performans üçün)
    const [reviews, totalReviews, ratingStats] = await Promise.all([
      // 1. Rəylərin gətirilməsi və yazarın adı/emailinin populate edilməsi
      this.reviewModel
        .find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .lean()
        .exec(),

      // 2. Ümumi sayı
      this.reviewModel.countDocuments(filter),

      // 3. Orta ulduz dərəcəsi və ümumi rəy sayısı
      this.reviewModel.aggregate([
        {
          $match: {
            $or: [
              { posterId: new mongoose.Types.ObjectId(posterId) },
              { posterId: posterId },
            ],
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
          },
        },
      ]),
    ]);

    // 📊 1, 2, 3, 4, 5 ulduz verilən rəylərin paylanmasını hesablayırıq
    const ratingDistribution = await this.reviewModel.aggregate([
      {
        $match: {
          $or: [
            { posterId: new mongoose.Types.ObjectId(posterId) },
            { posterId: posterId },
          ],
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    // 1-dən 5-dək default 0 ilə struktur təyin edirik
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((item) => { distribution[item._id] = item.count; });

    const totalPages = Math.ceil(totalReviews / limit);

    return {
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      stats: {
        averageRating: Math.round((ratingStats[0]?.averageRating || 0) * 10) / 10,
        totalReviews: ratingStats[0]?.totalReviews || 0,
        ratingDistribution: distribution,
      },
    };
  }

  /**
   * =======================================================================
   * 4️⃣ DELETE REVIEW (RƏYİ SİLMƏK)
   * =======================================================================
   * Addım 1: Rəyin varlığını və hüququ yoxlayır (İstifadəçi öz rəyini və ya Admin silə bilər).
   * Addım 2: Rəyin Cloudinary-də olan bütün şəkillərini paralel olaraq buluddan silir.
   * Addım 3: MongoDB-dən rəy sənədini silir (`findByIdAndDelete`).
   */
  public async deleteReview(reviewId: string, userId: string, role: UserRole) {
    if (!this.isValidObjectId(reviewId)) {
      throw new BadRequestException('Invalid ReviewId format');
    }

    const existingReview = await this.reviewModel.findById(reviewId);

    if (!existingReview) {
      throw new NotFoundException('No Review found to delete');
    }

    if (
      role !== UserRole.ADMIN &&
      existingReview.userId.toString() !== userId
    ) {
      throw new ForbiddenException('You can only delete your own review');
    }

    // Cloudinary-dəki bütün şəkilləri buluddan təmizləyirik
    if (existingReview.images && existingReview.images.length > 0) {
      const publicIds = existingReview.images.map((img) => img.public_id);
      await this.cloudinaryService.deleteMultipleImages(publicIds);
    }

    // Bazadan silirik
    await this.reviewModel.findByIdAndDelete(reviewId);

    return { message: 'Review deleted successfully' };
  }

  /**
   * 🛠️ KÖMƏKÇİ FUNKSİYA: MongoDB ObjectId Doğrulaması (24 Hex Chars)
   */
  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}

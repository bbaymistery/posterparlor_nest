import { Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { InjectModel } from '@nestjs/mongoose';
import { AddPosterDto, Poster, PosterDocument, UpdatePosterDto } from '@new-poster-parlor-api/models';
import { FilterQuery, Model } from 'mongoose';
import { FileStructure, FilterResponse, PosterFilter, PosterImage } from '@new-poster-parlor-api/shared';
import { BadRequestException, CustomHttpException, NotFoundException, ValidationException } from '@new-poster-parlor-api/utils';
import { UploadApiResponse } from 'cloudinary';

/**
 * 📦 InventoryService: Məhsul / Poster İdarəetmə Servisi
 * Bu servis posterlərin bazada (MongoDB) yaradılması, süzülməsi (filtrlənməsi),
 * yenilənməsi, silinməsi və şəkillərinin Cloudinary ilə sinxron idarə olunmasını həyata keçirir.
 */
@Injectable()
export class InventoryService {
  private ERROR = 'INVENTORY_ERROR';

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Poster.name)
    private readonly posterModel: Model<PosterDocument>
  ) { }

  /**
   * 1️⃣ `addInventoryItem(images, itemDetails)`: Yeni poster əlavə edir.
   * - Qiymət, stok və başlıq daxilolmalarını yoxlayır.
   * - Şəkilləri `CloudinaryService` vasitəsilə bulud serverə yükləyir.
   * - Əgər baza əməliyyatında xəta baş verərsə, yüklənmiş şəkilləri Cloudinary-dən avtomatik təmizləyir (Rollback).
   */
  async addInventoryItem(images: FileStructure[], itemDetails: AddPosterDto) {
    // Validation: Stok, şəkil, başlıq və qiymət doğrulamaları
    if (itemDetails.stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    if (images.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    if (itemDetails.title.trim().length === 0) {
      throw new BadRequestException('Title cannot be empty');
    }

    if (itemDetails.price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    let uploadResults: UploadApiResponse[] = [];

    try {
      // 1. Bütün şəkilləri birbaşa Cloudinary-yə yükləyirik:
      uploadResults = await this.cloudinaryService.uploadMultipleImages(images);

      // 2. Cloudinary-dən gələn URL və public_id-ləri Poster modelinə uyğunlaşdırırıq:
      const imageUploadResults: PosterImage[] = uploadResults.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      }));

      // 3. Yeni poster obyektini MongoDB bazasında saxlayırıq:
      const newInventoryItem = {
        ...itemDetails,
        images: imageUploadResults,
      };

      const createdInventoryItem = new this.posterModel(newInventoryItem);
      return await createdInventoryItem.save();
    } catch (error) {
      // ⚠️ Xəta baş verdikdə buludda yetim şəkil qalmamaq üçün yüklənən şəkilləri silirik (Rollback):
      if (uploadResults.length > 0) {
        const publicIds = uploadResults.map((result) => result.public_id);
        await this.cloudinaryService.deleteMultipleImages(publicIds);
      }
      throw new CustomHttpException('Unable to add inventory item', 500, this.ERROR, error);
    }
  }

  /**
   * 2️⃣ `getAllInventoryItem(page, limit, filters)`: Bütün posterləri dinamik filtrlərlə və səhifələmə (Pagination) ilə gətirir.
   * - Qiymət aralığı (`minPrice`, `maxPrice`), Stok, Kateqoriya, Tag-lər və Axtarış sözü üzrə süzür.
   */
  async getAllInventoryItem(page = 1, limit = 10, filters: PosterFilter = {}) {
    // Səhifə və limit doğrulaması
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    if (limit > 100) {
      throw new BadRequestException('Limit cannot exceed 100');
    }

    // Qiymət aralığı yoxlanışı
    if (filters.minPrice !== undefined && filters.minPrice < 0) {
      throw new BadRequestException('Minimum price cannot be negative');
    }

    if (filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice) {
      throw new BadRequestException('Minimum price cannot be greater than maximum price');
    }

    // Stok aralığı yoxlanışı
    if (filters.minStock !== undefined && filters.minStock < 0) {
      throw new BadRequestException('Minimum stock cannot be negative');
    }

    if (filters.minStock !== undefined && filters.maxStock !== undefined && filters.minStock > filters.maxStock) {
      throw new BadRequestException('Minimum stock cannot be greater than maximum stock');
    }

    const skip = (page - 1) * limit;
    const query = this.buildQuery(filters);
    const sort = this.buildSort(filters);

    // Mongoose ilə posterləri gətiririk və ümumi sayını hesablayırıq (Parallel execution):
    const [posters, total] = await Promise.all([
      this.posterModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .lean()
        .sort(sort)
        .exec(),
      this.posterModel.countDocuments(query),
    ]);

    return {
      posters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      filters: filters,
    };
  }

  /**
   * 3️⃣ `getInventoryItemById(id)`: Tək bir posteri ID-sinə görə tapır.
   */
  async getInventoryItemById(id: string) {
    if (!id || !this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid inventory item ID format');
    }

    const poster = await this.posterModel.findById(id).lean().exec();

    if (!poster) {
      throw new NotFoundException('Inventory item not found', { itemId: id });
    }

    return poster;
  }

  /**
   * 4️⃣ `searchInventoryItems(searchTerm, limit)`: Başlıq, təsvir və ya tag-lərdə sürətli axtarış aparır.
   */
  async searchInventoryItems(searchTerm: string, limit = 20) {
    const query: FilterQuery<PosterDocument> = {
      $or: [
        { title: new RegExp(searchTerm, 'i') },
        { description: new RegExp(searchTerm, 'i') },
        { tags: new RegExp(searchTerm, 'i') },
      ],
    };
    const items = await this.posterModel.find(query).limit(limit).lean().exec();
    return items;
  }

  /**
   * 5️⃣ `updateInventoryItem(id, newImages, updateDetails)`: Poster məlumatlarını və şəkillərini yeniləyir.
   * - Köhnə şəkillərdən silinməli olanları Cloudinary-dən təmizləyir (`imagesToDelete`).
   * - Yeni şəkillər varsa Cloudinary-yə yükləyir (`newImages`).
   * - Baza sənədini güncəlləyir.
   */
  async updateInventoryItem(id: string, newImages: FileStructure[], updateDetails: UpdatePosterDto) {
    const existingPoster = await this.posterModel.findById(id);
    if (!existingPoster) {
      throw new NotFoundException('Poster not found');
    }

    // Qiymət, stok və başlıq doğrulamaları
    if (updateDetails.stock !== undefined && updateDetails.stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    if (updateDetails.price !== undefined && updateDetails.price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    if (updateDetails.title !== undefined && updateDetails.title.trim().length === 0) {
      throw new BadRequestException('Title cannot be empty');
    }

    let uploadedImages: UploadApiResponse[] = [];
    let imagesToCleanup: string[] = [];

    try {
      let finalImages = [...existingPoster.images];
      const hasImageUpdates =
        newImages.length > 0 ||
        (updateDetails.imagesToDelete && updateDetails.imagesToDelete.length > 0) ||
        updateDetails.imageAction === 'replace';

      if (hasImageUpdates) {
        // A) Xüsusi silinməsi tələb olunan şəkilləri Cloudinary-dən silirik:
        if (updateDetails.imagesToDelete && updateDetails.imagesToDelete.length > 0) {
          const imagesToDelete = updateDetails.imagesToDelete;
          await this.cloudinaryService.deleteMultipleImages(imagesToDelete);
          finalImages = finalImages.filter((img) => !imagesToDelete.includes(img.public_id));
        }

        // B) Yeni gələn şəkilləri Cloudinary-yə yükləyirik:
        if (newImages.length > 0) {
          uploadedImages = await this.cloudinaryService.uploadMultipleImages(newImages);
          imagesToCleanup = uploadedImages.map((img) => img.public_id);
          const newImageObjects: PosterImage[] = uploadedImages.map((result) => ({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
          }));

          if (updateDetails.imageAction === 'replace') {
            // Hamısını əvəzləmək istəyiriksə, köhnə şəkillərin hamısını Cloudinary-dən silirik:
            const oldPublicIds = finalImages.map((img) => img.public_id);
            if (oldPublicIds.length > 0) {
              await this.cloudinaryService.deleteMultipleImages(oldPublicIds);
            }
            finalImages = newImageObjects;
          } else {
            // Əks halda yeni şəkilləri mövcud şəkillərin üzərinə əlavə edirik:
            finalImages = [...finalImages, ...newImageObjects];
          }
        }

        // Posterin ən azı 1 şəklinin olması mütləqdir:
        if (finalImages.length === 0) {
          throw new ValidationException('At least one image is required');
        }
      }

      // MongoDB güncəlləmə obyektini hazırlayırıq:
      const { imagesToDelete, imageAction, ...posterFields } = updateDetails as any;
      const updateData: Partial<Poster> = { ...posterFields };

      if (updateDetails.isAvailable !== undefined && updateDetails.isAvailable !== null) {
        updateData.isAvailable =
          updateDetails.isAvailable === true ||
          String(updateDetails.isAvailable) === 'true';
      }

      if (updateDetails.price !== undefined) {
        updateData.price = Number(updateDetails.price);
      }

      if (updateDetails.stock !== undefined) {
        updateData.stock = Number(updateDetails.stock);
      }

      if (hasImageUpdates) updateData.images = finalImages;

      const updatedPoster = await this.posterModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return updatedPoster;
    } catch (error) {
      if (imagesToCleanup.length > 0) {
        await this.cloudinaryService.deleteMultipleImages(imagesToCleanup);
      }
      throw new CustomHttpException('Failed to update poster details', 500, this.ERROR, error);
    }
  }

  /**
   * 6️⃣ `getFilters()`: Frontend-də sol menyu filtrləri üçün mövcud Kateqoriyaları (sayları ilə), Materialları və Ölçüləri qaytarır.
   */
  async getFilters(): Promise<FilterResponse> {
    const [categories, materials, dimensions] = await Promise.all([
      // MongoDB Aggregation: Hər kateqoriyaya neçə poster düşdüyünü hesablayır
      this.posterModel.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            count: 1,
          },
        },
      ]),

      // Unikal materiallar
      this.posterModel.distinct('material').lean().exec(),

      // Unikal ölçülər (dimensions)
      this.posterModel.distinct('dimensions').lean().exec(),
    ]);

    return { categories, materials, dimensions, };
  }

  /**
   * 7️⃣ `getFeaturedPosters(limit)`: Ana səhifədə nümayiş etdirmək üçün seçilmiş posterləri qaytarır.
   */
  async getFeaturedPosters(limit = 8): Promise<Poster[]> {
    const featuredPosters = await this.posterModel
      .find({ isAvailable: true })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean()
      .exec();
    return featuredPosters;
  }

  /**
   * 8️⃣ `deleteInventoryItem(id)`: Posteri bazadan tam silir (Hard Delete) VƏ onun Cloudinary-dəki bütün şəkillərini təmizləyir.
   */
  async deleteInventoryItem(id: string): Promise<void> {
    if (!id || !this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid inventory item ID format');
    }

    const itemToDelete = await this.posterModel.findById(id).exec();
    if (!itemToDelete) {
      throw new NotFoundException('Inventory item not found', { itemId: id });
    }

    // Cloudinary-dən bütün şəkilləri silirik:
    const imagePublicIds = itemToDelete.images.map((img) => img.public_id);
    if (imagePublicIds.length > 0) {
      await this.cloudinaryService.deleteMultipleImages(imagePublicIds);
    }

    // Bazadan poster sənədini silirik:
    await this.posterModel.findByIdAndDelete(id).exec();
  }

  /**
   * 9️⃣ `softDeleteInventoryItem(id)`: Posteri bazadan silmir, sadəcə `isAvailable: false` edərək satışdan çıxarır.
   */
  async softDeleteInventoryItem(id: string): Promise<void> {
    if (!id || !this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid inventory item ID format');
    }
    await this.posterModel
      .findByIdAndUpdate(id, { isAvailable: false }, { new: true })
      .exec();
  }

  // 🛠️ Köməkçi (Helper) Metodlar: MongoDB Query və Sort obyektlərini qurur:
  private buildQuery(filters: PosterFilter): FilterQuery<PosterDocument> {
    const query: FilterQuery<PosterDocument> = {};

    if (filters.isAvailable !== undefined) {
      query.isAvailable = filters.isAvailable;
    }

    if (filters.category) {
      query.category = new RegExp(`^${filters.category}$`, 'i');
    }

    if (filters.tags) {
      if (Array.isArray(filters.tags)) {
        query.tags = { $in: filters.tags.map((tag) => new RegExp(tag, 'i')) };
      } else {
        query.tags = new RegExp(filters.tags, 'i');
      }
    }

    if (filters.title) {
      query.title = new RegExp(filters.title, 'i');
    }

    if (filters.dimensions) {
      query.dimensions = new RegExp(`^${filters.dimensions}$`, 'i');
    }

    if (filters.material) {
      query.material = new RegExp(filters.material, 'i');
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = filters.maxPrice;
      }
    }

    if (filters.minStock !== undefined || filters.maxStock !== undefined) {
      query.stock = {};
      if (filters.minStock !== undefined) {
        query.stock.$gte = filters.minStock;
      }
      if (filters.maxStock !== undefined) {
        query.stock.$lte = filters.maxStock;
      }
    }

    if (filters.search) {
      query.$or = [
        { title: new RegExp(filters.search, 'i') },
        { description: new RegExp(filters.search, 'i') },
        { tags: new RegExp(filters.search, 'i') },
      ];
    }

    return query;
  }

  private buildSort(filters: PosterFilter): FilterQuery<PosterDocument> {
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    switch (filters.sortBy) {
      case 'price':
        return { price: sortOrder };
      case 'stock':
        return { stock: sortOrder };
      case 'title':
        return { title: sortOrder };
      case 'createdAt':
      default:
        return { createdAt: sortOrder };
    }
  }

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}

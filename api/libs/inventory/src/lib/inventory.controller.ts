import { Controller, Post, Bind, UploadedFiles, UseInterceptors, Body, Get, Query, Param, ParseIntPipe, Put, Delete } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Auth, Public } from '@new-poster-parlor-api/auth';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AddPosterDto, UpdatePosterDto, UserRole } from '@new-poster-parlor-api/models';
import { FileStructure, PosterFilter } from '@new-poster-parlor-api/shared';
import { HttpResponseUtil } from '@new-poster-parlor-api/utils';

/**
 * 🌐 InventoryController: Məhsul / Poster İdarəetmə API Girişləri (`/api/inventory`)
 * Bu controller brauzer və ya Postman-dan gələn şəkil fayllarını (multipart/form-data),
 * poster əlavə etmək, filtrləmək, yeniləmək və silmək sorğularını qəbul edir.
 */
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  /**
   * 1️⃣ `POST /api/inventory`: Yeni poster əlavə edir (Maksimum 5 şəkil ilə).
   * - `@UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))`: Express-dən gələn şəkil fayllarını qəbul edir.
   * - `@Body() itemDetails`: Body-də gələn title, price, description və DTO məlumatlarını oxuyur.
   */
  @Post()
  @Public()
  @Bind(UploadedFiles())
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async createInventoryItem(
    files: { images?: FileStructure[] },
    @Body() itemDetails: AddPosterDto
  ) {
    const images = files.images || [];

    const poster = await this.inventoryService.addInventoryItem(
      images,
      itemDetails
    );

    return poster;
  }

  /**
   * 2️⃣ `GET /api/inventory/featured`: Ana səhifədə nümayiş etdirmək üçün 8 seçilmiş posteri gətirir.
   */
  @Get('featured')
  @Public()
  async getFeaturedPosters() {
    const posters = await this.inventoryService.getFeaturedPosters(8);
    return posters;
  }

  /**
   * 3️⃣ `GET /api/inventory`: Bütün posterləri filtrlərlə və səhifələmə (Pagination) ilə gətirir.
   * Query parametrləri: page, limit, minPrice, maxPrice, category, tags, search, sortBy və s.
   */
  @Get()
  @Public()
  async getAllInventory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('title') title?: string,
    @Query('dimensions') dimensions?: string,
    @Query('material') material?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('minStock') minStock?: string,
    @Query('maxStock') maxStock?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'price' | 'stock' | 'createdAt' | 'title',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    const filters: PosterFilter = {};

    // Parsers
    if (isAvailable !== undefined) {
      filters.isAvailable = isAvailable === 'true';
    }

    if (category) filters.category = category;
    if (title) filters.title = title;
    if (dimensions) filters.dimensions = dimensions;
    if (material) filters.material = material;
    if (search) filters.search = search;

    // Verqüllə ayrılmış tag-ləri massivə çeviririk:
    if (tags) {
      filters.tags = tags.includes(',') ? tags.split(',').map((t) => t.trim()) : tags;
    }

    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (minStock) filters.minStock = parseInt(minStock, 10);
    if (maxStock) filters.maxStock = parseInt(maxStock, 10);

    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder;

    const result = await this.inventoryService.getAllInventoryItem(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      filters
    );
    return result;
  }

  /**
   * 4️⃣ `GET /api/inventory/search?q=space`: Sürətli canlı axtarış endpoint-i.
   */
  @Get('search')
  @Public()
  async searchInventoryItems(
    @Query('q') query: string,
    @Query('limit', ParseIntPipe) limit = 20
  ) {
    const items = await this.inventoryService.searchInventoryItems(query, limit);
    return items;
  }

  /**
   * 5️⃣ `GET /api/inventory/categories/list`: Sol filtr menyusu üçün kateqoriyaları və statistikalarını gətirir.
   */
  @Get('categories/list')
  @Public()
  async getAllFilters() {
    const filters = await this.inventoryService.getFilters();
    return filters;
  }

  /**
   * 6️⃣ `GET /api/inventory/:id`: Tək bir posteri ID-sinə görə tapır.
   */
  @Get(':id')
  @Public()
  async getInventoryItemById(@Param('id') id: string) {
    const poster = await this.inventoryService.getInventoryItemById(id);
    return poster;
  }

  /**
   * 7️⃣ `PUT /api/inventory/:id`: Yalnız ADMIN üçün poster güncəlləmə endpoint-i.
   * `@Auth(UserRole.ADMIN)`: Yalnız admin daxil ola bilər.
   */
  @Put(':id')
  @Auth(UserRole.ADMIN)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  async updateInventoryItem(
    @Param('id') id: string,
    @UploadedFiles() files: { images?: FileStructure[] },
    @Body() updateDetails: UpdatePosterDto
  ) {
    const newImages = files.images || [];

    const rawIsAvailable = (updateDetails as any).isAvailable;
    if (rawIsAvailable !== undefined && rawIsAvailable !== null) {
      updateDetails.isAvailable = rawIsAvailable === true || rawIsAvailable === 'true';
    }

    const updatedPoster = await this.inventoryService.updateInventoryItem(
      id,
      newImages,
      updateDetails
    );

    return updatedPoster;
  }

  /**
   * 8️⃣ `DELETE /api/inventory/:id`: Soft Delete (Posteri bazadan silmir, isAvailable: false edir).
   */
  @Delete(':id')
  @Auth(UserRole.ADMIN)
  async softDeleteInventoryItem(@Param('id') id: string) {
    await this.inventoryService.softDeleteInventoryItem(id);
    return HttpResponseUtil.deleted('Inventory item soft-deleted successfully');
  }

  /**
   * 9️⃣ `DELETE /api/inventory/:id/hard`: Hard Delete (Posteri bazadan və şəkillərini Cloudinary-dən tam silir).
   */
  @Delete(':id/hard')
  @Auth(UserRole.ADMIN)
  async deleteInventoryItem(@Param('id') id: string) {
    await this.inventoryService.deleteInventoryItem(id);
    return HttpResponseUtil.deleted('Inventory item deleted successfully');
  }
}

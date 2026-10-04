import { Injectable } from '@nestjs/common';
import { AppConfigService } from '@new-poster-parlor-api/config';
import { FileStructure } from '@new-poster-parlor-api/shared';
import { v2 as cloudinary, DeleteApiResponse, UploadApiResponse } from 'cloudinary';
import { CustomHttpException } from '@new-poster-parlor-api/utils';
import { Readable } from 'stream';

/**
 * ☁️ CloudinaryService: Bulud Yaddaşı Servisi
 * Bu servis şəkilləri Cloudinary bulud serverinə yükləmək, silmək və idarə etmək üçün istifadə olunur.
 */
@Injectable()
export class CloudinaryService {
  /**
   * 🏗️ Konstruktor: Cloudinary konfiqurasiyasını inicializasiya edir.
   * `.env` faylından oxunan cloud_name, api_key və api_secret parametrlərini Cloudinary SDK-sına ötürür.
   */
  constructor(private cloudConfig: AppConfigService) {
    cloudinary.config({
      cloud_name: this.cloudConfig.cloudinaryConfig.cloudinaryName,
      api_key: this.cloudConfig.cloudinaryConfig.cloudinaryApiKey,
      api_secret: this.cloudConfig.cloudinaryConfig.cloudinaryApiSecret,
    });
  }

  /**
   * 1️⃣ `uploadImage(file)`: Tək bir faylı (Buffer formasında) Cloudinary-yə yükləyir.
   * @param file Brauzerdən və ya Postman-dan gələn fayl obyekti (buffer və original ad saxlayır)
   * @returns Cloudinary-dən qayıdan cavab (şəkil URL-i secure_url və unikal public_id)
   */
  async uploadImage(file: FileStructure): Promise<UploadApiResponse> {
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        // Cloudinary-yə "Posters" qovluğuna şəkil kimi yükləmək tapşırığı verilir:
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'Posters', resource_type: 'image' },
          (error, res) => {
            if (error) return reject(error);
            resolve(res as UploadApiResponse);
          }
        );

        // Yaddaşdakı fayl Buffer-ini axına (Stream-ə) çevirib Cloudinary-yə ötürürük:
        const readable = this.bufferToReadable(file.buffer);
        readable.pipe(uploadStream);
      });

      if (!result || !result.secure_url) {
        throw new CustomHttpException('Cloudinary upload failed : No URL returned');
      }
      return result;
    } catch (err) {
      throw new CustomHttpException('Failed to Upload image to Cloudinary', 500, 'CLOUDINARY_ERROR', err);
    }
  }

  /**
   * 2️⃣ `uploadMultipleImages(files)`: Birdən çox şəkil faylını eyni anda parallell olaraq yükləyir.
   * @param files Şəkil faylları massivi (Array)
   */
  async uploadMultipleImages(files: FileStructure[]): Promise<UploadApiResponse[]> {
    if (!files || files.length === 0) {
      throw new CustomHttpException('No File provided for upload', 400);
    }

    // Hər bir fayl üçün uploadImage funksiyasını işə salıb Promise massivi yaradırıq:
    const uploadPromises = files.map((file) => this.uploadImage(file));

    try {
      // Promise.all ilə bütün şəkillərin paralel yüklənməsini gözləyirik:
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (err) {
      throw new CustomHttpException('Failed to upload multiple images', 500, 'CLOUDINARY_ERROR', err);
    }
  }

  /**
   * 3️⃣ `deleteImage(publicId)`: Cloudinary-dən verilmiş unikal `public_id` ilə şəkil silir.
   * @param publicId Silinəcək şəklin Cloudinary ID-si (məsələn: "Posters/abc123xyz")
   */
  async deleteImage(publicId: string): Promise<DeleteApiResponse> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });

      if (result.result !== 'ok' && result.result !== 'notfound') {
        throw new CustomHttpException(`Cloudinary delete image service failed: ${result.result}`);
      }
      return result;
    } catch (err) {
      throw new CustomHttpException(`Failed to delete image from cloudinary`, 500, 'CLOUDINARY_ERROR', err);
    }
  }

  /**
   * 4️⃣ `deleteMultipleImages(publicIds)`: Çoxlu şəkil ID-lərini eyni anda paralel olaraq Cloudinary-dən silir.
   * @param publicIds Silinəcək `public_id`-lərin siyahısı (Array)
   */
  async deleteMultipleImages(publicIds: string[]): Promise<void> {
    try {
      const deletePromise = publicIds.map((id) => this.deleteImage(id));
      await Promise.all(deletePromise);
    } catch (err) {
      throw new CustomHttpException('Failed to delete multiple images from cloudinary', 500, 'CLOUDINARY_ERROR', err);
    }
  }

  /**
   * 🛠️ Köməkçi (Helper) Metod: `bufferToReadable(buffer)`
   * Node.js yaddaşındakı (RAM) ikilik fayl məlumatını (Buffer) məlumat axınına (Readable Stream) çevirir.
   */
  bufferToReadable(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}

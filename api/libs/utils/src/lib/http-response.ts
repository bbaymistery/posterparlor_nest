/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@new-poster-parlor-api/shared';

/**
 * 📦 HTTP RESPONSE UTIL (Hazır Bəzəkli Cavab Qutuları)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * Kontrollerlərdə uğurlu cavabları əllə uzun-uzadı hazırlamamaq üçün
 * statik yardımçı metoddur.
 * 
 * 🛠️ İSTİFADƏ QAYDASI:
 * `return HttpResponseUtil.success(users);`
 * `return HttpResponseUtil.created(newUser);`
 */
export class HttpResponseUtil {
  /**
   * 🛠️ Özəl köməkçi metod: Bütün cavabları vahid obyektə salır
   */
  private static createResponse<T>(success: boolean, message: string, statusCode: HttpStatus, data?: T, error?: any, path?: string): ApiResponse<T> {
    return { success, message, data, error, statusCode, timestamp: new Date().toISOString(), path: path || '' };
  }

  /**
   * 🎁 200 OK — Standart Uğurlu Məlumat Cavabı
   */
  static success<T>(data: T, message = 'Success', path?: string): ApiResponse<T> {
    return this.createResponse(true, message, HttpStatus.OK, data, undefined, path);
  }

  /**
   * ✨ 201 CREATED — Yeni resurs (istifadəçi, poster və s.) yaradıldıqda
   */
  static created<T>(data: T, message = 'Resource created successfully', path?: string): ApiResponse<T> {
    return this.createResponse(true, message, HttpStatus.CREATED, data, undefined, path);
  }

  /**
   * 🔄 200 OK — Resurs yeniləndikdə
   */
  static updated<T>(data: T, message = 'Resource updated successfully', path?: string): ApiResponse<T> {
    return this.createResponse(true, message, HttpStatus.OK, data, undefined, path);
  }

  /**
   * 🗑️ 200 OK — Resurs silindikdə
   */
  static deleted(message = 'Resource deleted successfully', path?: string): ApiResponse<null> {
    return this.createResponse(true, message, HttpStatus.OK, null, undefined, path);
  }
}


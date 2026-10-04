import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { MongoError } from 'mongodb';
import { AppLogger } from '@new-poster-parlor-api/logger';
import { parseStackTrace } from '../lib/stack-trace-parser';
import { handleHttpError } from './handler/http-error.handler';
import { handleMongooseValidationError } from './handler/validation-error.handler';
import { handleMongooseCastError } from './handler/mongoose-cast-error.handler';
import { handleMongoError } from './handler/mongo-error.handler';
import { handleGenericError } from './handler/generic-error.handler';
import { ErrorResponse } from '@new-poster-parlor-api/shared';

/**
 * 🛡️ GLOBAL EXCEPTION FILTER (XƏTA QAPIÇISI)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * Koddakı İstənilən Yerdə (Controller, Service, Guard, Pipe) bir xəta baş verərsə (`throw new Error()` və ya `throw new NotFoundException()`),
 * NestJS avtomatik olaraq sorğunu dayandırır və xətanı BU FİLTERƏ verir.
 * 
 * 🛠️ İŞLƏMƏ PRİNSİPİ:
 * 1. `@Catch()` anotasiyası ilə bütün xətaları mərkəzləşdirilmiş şəkildə tutur.
 * 2. `resolveError()` metodu xətanın tipini yoxlayır (HttpException, MongoError, ValidationError).
 * 3. Xətanın növünə uyğun `handler/` qovluğundakı müvafiq funksiyanı çağırır.
 * 4. Xətanı standart JSON formatına salır və Winston loqqerinə yazır.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('HTTP');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const path = req.url;

    // 1. Xətanın tipinə uyğun handler-i tapıb təmiz ErrorResponse JSON obyektini alırıq
    const errorResponse = this.resolveError(exception, path);

    // 2. Log faylı üçün metadataları (əlavə statistik məlumatları) hazırlayırıq
    const metadata: Record<string, unknown> = {
      statusCode: errorResponse.statusCode,
      errorCode: errorResponse.error.code,
      path,
      method: req.method,
      timestamp: errorResponse.timestamp,
    };

    // Əgər local mühitdəyiksə (NODE_ENV === 'development'), xətanın hansı fayl və sətirdə baş verdiyini əlavə edirik
    if (process.env['NODE_ENV'] === 'development') {
      if (exception instanceof Error) {
        const stackFrames = parseStackTrace(exception, 3);
        if (stackFrames.length > 0) {
          metadata['trace'] = stackFrames;
        }
      }

      if (errorResponse.error.details) {
        metadata['details'] = errorResponse.error.details;
      }

      if (errorResponse.error.validationErrors) {
        metadata['validationErrors'] = errorResponse.error.validationErrors;
      }
    }

    // 3. Xətanı logs/error-YYYY-MM-DD.log faylına yazırıq
    const logMessage = `${req.method} ${path} - ${errorResponse.statusCode} - ${errorResponse.message}`;

    if (exception instanceof Error) {
      this.logger.errorWithMetadata(logMessage, exception, metadata);
    } else {
      this.logger.errorWithMetadata(logMessage, new Error(String(exception)), metadata);
    }

    // 4. Brauzerə standart xəta JSON-u və HTTP Status Kodunu göndəririk!
    res.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * 🔀 RESOLVE ERROR (XƏTA YÖNLƏNDİRİCİSİ)
   * 
   * Gələn xətanın hansı sinfə aid olduğunu yoxlayır və uyğun Handler-ə ötürür.
   */
  private resolveError(exception: unknown, path: string): ErrorResponse {
    // A) NestJS-in Standart HTTP xətasıdırsa (400, 401, 403, 404, 409 və s.)
    if (exception instanceof HttpException) {
      return handleHttpError(exception, path);
    }

    // B) Mongoose Şema Validation xətasıdırsa (Məs: e-poçt düzgün deyil, vacib sahə boşdur)
    if (exception instanceof MongooseError.ValidationError) {
      return handleMongooseValidationError(exception, path);
    }

    // C) Mongoose Yalnış ID Formatıdırsa (Məs: 24 simvol əvəzinə '123' yazılıbsa)
    if (exception instanceof MongooseError.CastError) {
      return handleMongooseCastError(exception, path);
    }

    // D) MongoDB Drayver xətasıdırsa (Məs: Təkrar unikal e-poçt daxil edilib, code 11000)
    if (exception instanceof MongoError) {
      return handleMongoError(exception, path);
    }

    // E) Gözlənilməz digər bütün kənar JavaScript/Sistem xətaları (500 Internal Server Error)
    return handleGenericError(exception, path);
  }
}


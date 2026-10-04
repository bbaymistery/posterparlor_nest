import { HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';
import { ErrorResponse } from '@new-poster-parlor-api/shared';

/**
 * 🍃 MONGO ERROR HANDLER (MongoDB Drayver Xətaları Həll Edicisi)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * MongoDB verilənlər bazası drayveri daxilində xəta baş verdikdə bu funksiya işə düşür.
 * 
 * 🔍 NƏ EDİR?
 * 1. Ən çox qarşılaşılan `code === 11000` (Duplicate Key / Təkrar Unikal Sahə) xətasını yoxlayır.
 *    (Məsələn: Artıq bazada olan e-poçt ünvanı ilə yenidən qeydiyyatdan keçmək istədikdə).
 * 2. Təkrar sahə olduqda status kodunu `409 CONFLICT` təyin edir və hansı sahənin (`field`) təkrarlandığını göstərir.
 * 3. Digər bazalardakı kənar xətalara isə `500 INTERNAL_SERVER_ERROR` verir.
 */
export function handleMongoError(exception: MongoError, path: string): ErrorResponse {
  // MongoDB xəta kodu 11000 olarsa, bu təkrar unikal sahə xətası deməkdir (Məs: e-poçt təkrarıdır)
  const isDuplicate = exception.code === 11000;

  // MongoError-dan təkrar olunan sahənin adını (keyPattern) alırıq (Məsələn: { email: 1 })
  const keyPattern = (
    exception as MongoError & { keyPattern?: Record<string, number> }
  ).keyPattern;

  return {
    success: false,
    message: isDuplicate ? 'Resource already exists' : 'Database Error',
    statusCode: isDuplicate ? HttpStatus.CONFLICT : HttpStatus.INTERNAL_SERVER_ERROR,
    path,
    timestamp: new Date().toISOString(),
    error: {
      code: isDuplicate ? 'DUPLICATE_KEY' : 'DATABASE_ERROR',
      // Təkrar sahə xətasıdırsa, tam olaraq hansı sahənin təkrarlandığını göstəririk (Məs: email)
      ...(isDuplicate &&
        keyPattern && {
        details: {
          field: Object.keys(keyPattern)[0],
        },
      }),
    },
  };
}


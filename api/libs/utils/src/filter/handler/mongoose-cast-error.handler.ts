import { HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '@new-poster-parlor-api/shared';
import { Error as MongooseError } from 'mongoose';

/**
 * 🆔 MONGOOSE CAST ERROR HANDLER (Yanlış ID / Data Tipi Formatı Xətası Həll Edicisi)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * İstifadəçi URL-də və ya sorğuda MongoDB-nin tələb etdiyi standart 24 simvolluq ObjectId əvəzinə
 * səhv/nümayiş olunmayan format daxil etdikdə (məsələn: GET /api/users/123-abc) Mongoose `CastError` atır.
 * 
 * 🔍 NƏ EDİR?
 * 1. Mongoose xətasından sahənin adını (`exception.path` -> `_id`) və daxil edilən səhv dəyəri alırıq.
 * 2. `400 BAD_REQUEST` status kodu ilə `"Invalid _id: 123-abc"` kimi təmiz xəta qaytarır.
 */
export function handleMongooseCastError(exception: MongooseError.CastError, path: string): ErrorResponse {
  return {
    success: false,
    message: `Invalid ${exception.path}: ${exception.value}`,
    statusCode: HttpStatus.BAD_REQUEST,
    path,
    timestamp: new Date().toISOString(),
    error: {
      code: 'INVALID_ID',
      details: {
        field: exception.path,
        value: exception.value,
      },
    },
  };
}


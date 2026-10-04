import { HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '@new-poster-parlor-api/shared';
import { Error as MongooseError } from 'mongoose';

/**
 * 📝 MONGOOSE VALIDATION ERROR HANDLER (Mongoose Şema Doğrulama Xətası Həll Edicisi)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * Mongoose modelinə daxil olan məlumat şema tələblərinə cavab vermədikdə
 * (məsələn: tələb olunan `required: true` sahə boşdur, və ya min/max uzunluğu pozulub) işə düşür.
 * 
 * 🔍 NƏ EDİR?
 * 1. Mongoose `exception.errors` daxilindəki bütün pozulmuş sahələri bir-bir dözür.
 * 2. Hər bir sahə üçün { field: 'email', message: 'Email is required' } şəklində təmiz massiv hazırlayır.
 * 3. HTTP status kodunu `422 UNPROCESSABLE_ENTITY` olaraq brauzerə təhvil verir.
 */
export function handleMongooseValidationError(exception: MongooseError.ValidationError, path: string): ErrorResponse {
  // Pozulmuş bütün şema sahələrini dövr edib təmiz massivə salırıq
  const validationErrors = Object.values(exception.errors).map((err) => ({
    field: err.path,
    message: err.message,
  }));

  return {
    success: false,
    message: 'Validation failed',
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    path,
    timestamp: new Date().toISOString(),
    error: {
      code: 'VALIDATION_ERROR',
      validationErrors,
    },
  };
}


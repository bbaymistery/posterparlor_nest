import { HttpException } from '@nestjs/common';
import { ErrorResponse } from '@new-poster-parlor-api/shared';

/**
 * 🛠️ HTTP ERROR HANDLER (Standart HTTP Xəta Həll Edicisi)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * NestJS-də `HttpException` və ya `CustomHttpException` baş verdikdə xətanı tutur,
 * custom error code-ları (`INVENTORY_ERROR`, `DUPLICATE_KEY` və s.) və xəta detallarını
 * təmiz JSON cavabına çevirir.
 */
export function handleHttpError(exception: HttpException, path: string): ErrorResponse {
  const statusCode = exception.getStatus();
  const response = exception.getResponse() as any;

  const isValidationError = Array.isArray(response?.message);

  return {
    success: false,
    message: isValidationError
      ? 'Validation failed'
      : typeof response === 'string'
        ? response
        : response?.message || 'Bad Request',
    statusCode,
    path,
    timestamp: new Date().toISOString(),
    error: {
      code: response?.code || response?.error || 'HTTP_EXCEPTION',
      ...(response?.details && { details: response.details }),
      ...(isValidationError && {
        validationErrors: (response.message as string[]).map((msg: string) => ({
          field: msg.split(' ')[0],
          message: msg,
        })),
      }),
    },
  };
}

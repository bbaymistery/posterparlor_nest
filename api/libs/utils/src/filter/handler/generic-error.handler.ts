import { HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '@new-poster-parlor-api/shared';

/**
 * ⚠️ GENERIC ERROR HANDLER (Gözlənilməz Kənar JavaScript Xətaları Həll Edicisi)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * Koddakı digər heç bir xüsusi Handler-ə uyğun gəlməyən, tutulmamış gözlənilməz kənar JavaScript xətası
 * (məsələn: `TypeError: Cannot read property 'name' of undefined`, kodda yalnış dəyişən istifadəsi və s.) baş verdikdə işə düşür.
 * 
 * 🔍 NƏ EDİR?
 * 1. `500 INTERNAL_SERVER_ERROR` status kodu qaytarır.
 * 2. Təhlükəsizlik üçün: Production mühitində sistemin daxili xəta detallarını gizlədir,
 *    Yalnız `NODE_ENV === 'development'` olduqda xəta detallarını göstərir!
 */
export function handleGenericError(exception: Error | unknown, path: string): ErrorResponse {
  const errorMessage =
    exception instanceof Error ? exception.message : 'Unknown error';

  return {
    success: false,
    message: 'Internal server error',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    path,
    timestamp: new Date().toISOString(),
    error: {
      code: 'INTERNAL_ERROR',
      // Yalnız lokal development mühitində xətanın dəqiq mesajını veririk ki, təhlükəsizlik pozulmasın
      details:
        process.env['NODE_ENV'] === 'development' ? errorMessage : undefined,
    },
  };
}


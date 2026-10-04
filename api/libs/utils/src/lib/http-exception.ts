/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 🔔 CUSTOM HTTP EXCEPTIONS (Xüsusi Həyəcan Zəngləri)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * NestJS-də standart `HttpException` klassını genişləndirərək (extend edərək)
 * layihə daxilində xüsusi xəta sinifləri yaradırıq.
 * 
 * 🛠️ İSTİFADƏ QAYDASI:
 * Kod daxilində sadəcə `throw new NotFoundCustomException('İstifadəçi tapılmadı')` və ya
 * `throw new UnauthorizedCustomException('Daxil olmaq üçün token lazımdır')` yazırıq.
 */

/**
 * 🧱 1. ƏSAS BAZA KLASS (`CustomHttpException`)
 * Bütün xüsusi xətalarımız bu ana klassdan törəyir.
 */
export class CustomHttpException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR, code?: string, details?: any) {
    super(
      { message, code: code || 'INTERNAL_ERROR', details },
      statusCode
    );
  }
}

/**
 * 🚫 400 Bad Request — Yanlış sorğu daxil edildikdə
 */
export class BadRequestException extends CustomHttpException {
  constructor(message = 'Bad Request', details?: any) {
    super(message, HttpStatus.BAD_REQUEST, 'BAD_REQUEST', details);
  }
}

/**
 * 🛑 401 Unauthorized — İstifadəçi giriş etməyib (Autentifikasiya yoxdur)
 */
export class UnauthorizedException extends CustomHttpException {
  constructor(message = 'Unauthorized', details?: any) {
    super(message, HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED', details);
  }
}

/**
 * ⛔ 403 Forbidden — İstifadəçinin bu resursa baxmağa hüququ (icazəsi) yoxdur
 */
export class ForbiddenException extends CustomHttpException {
  constructor(message = 'Forbidden', details?: any) {
    super(message, HttpStatus.FORBIDDEN, 'FORBIDDEN', details);
  }
}

/**
 * 🔍 404 Not Found — Axtarılan məlumat və ya resurs tapılmadıqda
 */
export class NotFoundException extends CustomHttpException {
  constructor(message = 'Resource not found', details?: any) {
    super(message, HttpStatus.NOT_FOUND, 'NOT_FOUND', details);
  }
}

/**
 * ⚔️ 409 Conflict — Konflikt baş verdikdə (Məsələn: e-poçt artıq bazada var)
 */
export class ConflictException extends CustomHttpException {
  constructor(message = 'Conflict', details?: any) {
    super(message, HttpStatus.CONFLICT, 'CONFLICT', details);
  }
}

/**
 * 📝 422 Unprocessable Entity — DTO / Şema məlumatların yoxlanması pozulduqda
 */
export class ValidationException extends CustomHttpException {
  constructor(message = 'Validation failed', validationErrors?: any[]) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', validationErrors);
  }
}


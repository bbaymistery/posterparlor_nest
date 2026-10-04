/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AppLogger } from '@new-poster-parlor-api/logger';
import { Request, Response } from 'express';
import { SuccessResponse } from '@new-poster-parlor-api/shared';

/**
 * 🎯 RESPONSE INTERCEPTOR (UĞURLU CAVAB KEŞİKCİSİ)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * İstifadəçi brauzerdən sorğu atdıqda NestJS-də bu Interceptor 2 fərqli fazada (mərhələdə) işləyir:
 * 
 * 1️⃣ BEFORE PHASE (Kontrollerdən Əvvəl):
 *    Sorğu kontrollerə çatmazdan əvvəl vaxtı (`startTime`) saxlayır və sorğunun məlumatlarını (URL, Method, IP) yığır.
 * 
 * 2️⃣ AFTER PHASE (Kontrollerdən Sonra):
 *    Kontroller öz işini bitirib məlumat qaytaranda (məsələn: { database: { status: 'up' } }),
 *    `next.handle().pipe(map(...))` bu cavabı tutur. Cavabın üstünə `success: true`, status kodu, dəqiq tarix 
 *    və icra müddətini (ms) əlavə edib brauzerə təhvil verir.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  constructor(private readonly logger: AppLogger) {
    // Winston loqqerimizin kontekstini 'HTTP' olaraq təyin edirik
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    // =========================================================================
    // 🟡 1. BEFORE PHASE (GİRİŞ MƏRHƏLƏSİ — Kontroller Kodundan ƏVVƏL İcra Olunur)
    // =========================================================================
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const user = (request as any).user;

    // Sorğunun daxil olduğu Kontroller və Metod adını alırıq
    const controller = context.getClass().name;
    const handler = context.getHandler().name;

    // Sorğunun başladığı dəqiq vaxtı milisaniyə (ms) ilə qeyd edirik
    const startTime = Date.now();

    // =========================================================================
    // 🟢 2. AFTER PHASE (ÇIXIŞ MƏRHƏLƏSİ — next.handle() Kontrolleri İcra Edir)
    // =========================================================================
    // next.handle() çağırılanda NestJS sorğunu Kontrollerə ötürür.
    // Kontroller öz işini qurtardıqdan sonra qaytardığı nəticə .pipe(map(...)) daxilinə düşür!
    return next.handle().pipe(
      map((data) => {
        // Kontroller işini bitirdi! Neçə ms çəkdiyini hesablayırıq:
        const statusCode = response.statusCode;
        const duration = Date.now() - startTime;

        // Yoxlayırıq: Bəlkə bu cavab artıq zərflənib? (success, statusCode, timestamp var?)
        const isAlreadyWrapped =
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'statusCode' in data &&
          'timestamp' in data;

        // Əgər cavab artıq formata salınıbsa, olduğu kimi saxla və loq yaz
        if (isAlreadyWrapped) {
          data.path = data.path || url;
          data.timestamp = data.timestamp || new Date().toISOString();

          this.logger.logWithMetadata(
            `✓ ${method} ${url} ${statusCode} - ${duration}ms`,
            {
              method,
              url,
              statusCode,
              duration: `${duration}ms`,
              userId: user?.id || user?.sub,
              ip: (headers['x-forwarded-for'] as string) || ip,
              userAgent,
              controller,
              handler,
            }
          );

          return data;
        }

        // 🎁 STANDART UĞURLU ZƏRF (SUCCESS RESPONSE BUILDER)
        // Kontrollerdən sadə obyekt qaytmışdısa (məs: { user: 'Ali' }), onu gözəl zərfə bükürük:
        const successResponse: SuccessResponse<T> = {
          success: true,
          message: 'Request successful',
          data: data,
          timestamp: new Date().toISOString(),
          path: url,
        };

        // Loq faylımıza (logs/app-YYYY-MM-DD.log) ulduzlu yaşıl loq yazırıq:
        this.logger.logWithMetadata(
          `✓ ${method} ${url} ${statusCode} - ${duration}ms`,
          {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            userId: user?.id || user?.sub,
            ip: (headers['x-forwarded-for'] as string) || ip,
            userAgent,
            controller,
            handler,
          }
        );

        return successResponse;
      }),
      // Əgər kontrollerdə və ya xidmətdə XƏTA (Error) atılarsa tap() bunu loqlamaq üçün tutur
      tap({
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;

          // Xətanı loqlayırıq, cavab hissəsini isə dərhal GlobalExceptionFilter-ə buraxırıq!
          this.logger.logWithMetadata(
            `✗ ${method} ${url} ${statusCode} - ${duration}ms`,
            {
              method,
              url,
              statusCode,
              duration: `${duration}ms`,
              userId: user?.id || user?.sub,
              ip: (headers['x-forwarded-for'] as string) || ip,
              controller,
              handler,
              error: error?.message,
            }
          );
        },
      })
    );
  }
}


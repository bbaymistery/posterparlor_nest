/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AppLogger } from '@new-poster-parlor-api/logger';
import { AppConfigService } from '@new-poster-parlor-api/config';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter, ResponseInterceptor, } from '@new-poster-parlor-api/utils';
import cookieParser from 'cookie-parser';
import { JwtAuthGuard } from '@new-poster-parlor-api/auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Logger configuration
  const logger = app.get(AppLogger);
  logger.setContext("Bootstrap");
  app.useLogger(logger);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const config = app.get(AppConfigService);

  app.use(cookieParser())

  app.enableCors({
    credentials: true,
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true); // mobile / Postman

      if (config.appConfig.allowedOrigin.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global filters and interceptors (inject logger)
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useGlobalInterceptors(new ResponseInterceptor(logger));

  //GLobal gaurds
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  const port = config.appConfig.port || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();

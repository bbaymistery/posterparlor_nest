import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig, } from '@new-poster-parlor-api/shared';
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) { }

  get appConfig(): AppConfig {
    return {
      nodeEnv: this.configService.getOrThrow<'development' | 'production'>('NODE_ENV'),
      port: this.configService.getOrThrow<number>('PORT'),
      allowedOrigin: this.configService.getOrThrow<string[]>('ALLOWED_ORIGINS'),
    };
  }
  get dbConfig() {
    return {
      dbname: this.configService.getOrThrow<string>('DB_NAME'),
      dburl: this.configService.getOrThrow<string>('DB_URL'),
      poolsize: this.configService.getOrThrow<number>('POOL_SIZE'),
    };
  }

  get authConfig() {
    return {
      clientId: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: this.configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackUrl: this.configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      jwtAccessTokenSecret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      jwtAccessTokenExpiry: this.timeStringToMilliseconds(this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRES_IN')),
      jwtRefreshTokenSecret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      jwtRefreshTokenExpiry: this.timeStringToMilliseconds(this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRES_IN')),
    };
  }

  get cloudinaryConfig() {
    return {
      cloudinaryName: this.configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      cloudinaryApiKey: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      cloudinaryApiSecret: this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    };
  }

  get paymentConfig() {
    return {
      stripePublishableKey: this.configService.getOrThrow<string>('STRIPE_PUBLISHABLE_KEY'),
      stripeSecretKey: this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    };
  }
  get isDevelopment(): boolean {
    return this.appConfig.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.appConfig.nodeEnv === 'production';
  }
  private timeStringToMilliseconds(timeStr: string): number {
    // Extract days, hours, and minutes using regex
    const daysMatch = timeStr.match(/(\d+)d/);
    const hoursMatch = timeStr.match(/(\d+)h/);
    const minutesMatch = timeStr.match(/(\d+)m/);

    const days: number = daysMatch ? parseInt(daysMatch[1]) : 0;
    const hours: number = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes: number = minutesMatch ? parseInt(minutesMatch[1]) : 0;

    // Convert to milliseconds
    const milliseconds: number =
      days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000;

    return milliseconds;
  }
}

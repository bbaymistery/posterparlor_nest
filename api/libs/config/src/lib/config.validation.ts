import { Logger } from '@nestjs/common';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, Matches, Max, Min, NotEquals, ValidateIf, validateSync, ValidationError, } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
}

class EnvironmentVaribale {
  @IsEnum(Environment, {
    message: 'NODE_ENV must be either production or development',
  })
  @IsNotEmpty({ message: 'NODE_ENV is required' })
  NODE_ENV!: Environment;

  @Type(() => Number)
  @IsNumber({}, { message: 'PORT must be a valid number' })
  @Min(1000, { message: 'PORT must be at least 1000' })
  @Max(65535, { message: 'PORT must be less than 65535' })
  PORT!: number;
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((origin: string) => origin.trim())
      : []
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^https?:\/\/.+$/, { each: true })
  @ValidateIf((env) => env.NODE_ENV === 'production')
  @NotEquals('*')
  ALLOWED_ORIGINS!: string[];

  @IsString({ message: 'DB_URL must be a valid string' })
  @IsNotEmpty({ message: 'DB_URL is required' })
  DB_URL!: string;

  @IsString({ message: 'DB_NAME must be a valid string' })
  @IsNotEmpty({ message: 'DB_NAME is required' })
  DB_NAME!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'POOL_SIZE must be a number' })
  @Min(1, { message: 'POOL_SIZE must be at least 1' })
  @Max(30, { message: 'POOL_SIZE must be less than 30' })
  POOL_SIZE!: number;

  /* ---------------- GOOGLE OAUTH ---------------- */

  @IsString({ message: 'GOOGLE_CLIENT_ID must be a valid string' })
  @IsNotEmpty({ message: 'GOOGLE_CLIENT_ID is required' })
  GOOGLE_CLIENT_ID!: string;

  @IsString({ message: 'GOOGLE_CLIENT_SECRET must be a valid string' })
  @IsNotEmpty({ message: 'GOOGLE_CLIENT_SECRET is required' })
  GOOGLE_CLIENT_SECRET!: string;

  @IsString({ message: 'GOOGLE_CALLBACK_URL must be a valid string' })
  @IsNotEmpty({ message: 'GOOGLE_CALLBACK_URL is required' })
  GOOGLE_CALLBACK_URL!: string;

  /* ---------------- JWT ---------------- */

  @IsString({ message: 'JWT_ACCESS_TOKEN_SECRET must be a valid string' })
  @IsNotEmpty({ message: 'JWT_ACCESS_TOKEN_SECRET is required' })
  JWT_ACCESS_TOKEN_SECRET!: string;

  @IsString({ message: 'JWT_ACCESS_TOKEN_EXPIRES_IN must be a valid string' })
  @IsNotEmpty({ message: 'JWT_ACCESS_TOKEN_EXPIRES_IN is required' })
  JWT_ACCESS_TOKEN_EXPIRES_IN!: string;

  @IsString({ message: 'JWT_REFRESH_TOKEN_SECRET must be a valid string' })
  @IsNotEmpty({ message: 'JWT_REFRESH_TOKEN_SECRET is required' })
  JWT_REFRESH_TOKEN_SECRET!: string;

  @IsString({ message: 'JWT_ACCESS_TOKEN_EXPIRES_IN must be a valid string' })
  @IsNotEmpty({ message: 'JWT_ACCESS_TOKEN_EXPIRES_IN is required' })
  JWT_REFRESH_TOKEN_EXPIRES_IN!: string;

  /* ---------------- Cloudinary ---------------- */
  @IsString({ message: 'CLOUDINARY_CLOUD_NAME must be a valid string' })
  @IsNotEmpty({ message: 'CLOUDINARY_CLOUD_NAME is required' })
  CLOUDINARY_CLOUD_NAME!: string;

  @IsString({ message: 'CLOUDINARY_API_KEY must be a valid string' })
  @IsNotEmpty({ message: 'CLOUDINARY_API_KEY is required' })
  CLOUDINARY_API_KEY!: string;

  @IsString({ message: 'CLOUDINARY_API_SECRET must be a valid string' })
  @IsNotEmpty({ message: 'CLOUDINARY_API_SECRETs is required' })
  CLOUDINARY_API_SECRET!: string;

  /* ---------------- Stripe ---------------- */
  @IsString({ message: 'STRIPE_PUBLISHABLE_KEY must be a valid string' })
  @IsNotEmpty({ message: 'STRIPE_PUBLISHABLE_KEY is required' })
  STRIPE_PUBLISHABLE_KEY!: string;

  @IsString({ message: 'STRIPE_SECRET_KEY must be a valid string' })
  @IsNotEmpty({ message: 'STRIPE_SECRET_KEY is required' })
  STRIPE_SECRET_KEY!: string;
}

const logger = new Logger('ConfigValidation');

function formatValidationError(errors: ValidationError[]): string {
  return errors
    .map((err) => {
      const constraints = err.constraints || {};
      const msg = Object.values(constraints);

      return ` ✗ ${err.property} : ${msg.join(', ')} `;
    })
    .join('\n');
}
export function validateEnv(config: Record<string, unknown>) {
  logger.debug('Validating Environment varibale is in progress...');

  const cleanConfig = Object.entries(config).reduce((acc, [key, value]) => {
    acc[key] = value === '' ? undefined : value;
    return acc;
  }, {} as Record<string, unknown>);
  const validateConfig = plainToInstance(EnvironmentVaribale, cleanConfig, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validateConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formattedErrors = formatValidationError(errors);

    logger.error('Environment Validation Failed');
    logger.error(formattedErrors);

    console.error(`\n ✗ Please fix the above env varibale in your .env file\n`);
    process.exit(1);
  }
  logger.log('✓ Environment varibale validated successfully');
}

import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * 📩 CREATE REVIEW DTO (Rəy Yaradılması DTO-su)
 * 
 * İstifadəçi posterə rəy yazarkən (ulduz balı 1-5 arası, rəy mətni) gələn məlumatları doğrulayır.
 */
export class createReviewDto {
  @IsMongoId()
  @IsOptional()
  posterId?: string;

  @IsMongoId()
  @IsOptional()
  userId?: string;

  // Qiymətləndirmə ulduzu: Mütləq 1 ilə 5 arasında ədəd olmalıdır! (@Min(1), @Max(5))
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating!: number;

  // Şərh mətni: Maksimum 500 simvol ola bilər
  @IsString()
  @IsOptional()
  @MaxLength(500)
  comment?: string;
}

/**
 * 🔄 UPDATE REVIEW DTO (Rəyin Yenilənməsi DTO-su)
 */
export class updateReviewDto {
  @IsMongoId()
  @IsOptional()
  posterId?: string;

  @IsMongoId()
  @IsOptional()
  userId?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagesToDelete?: string[];

  @IsOptional()
  @IsEnum(['replace', 'add'])
  imageAction?: 'replace' | 'add';
}


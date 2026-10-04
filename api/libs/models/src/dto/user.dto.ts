import { IsNotEmpty, IsJWT } from 'class-validator';

/**
 * 📩 GOOGLE LOGIN DTO (Data Transfer Object)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * İstifadəçi brauzerdən Google düyməsinə basıb daxil olmaq istədikdə,
 * brauzerdən serverə (Auth API-yə) gələn sorğunun gövdəsini (Request Body) yoxlayır.
 * 
 * 🛡️ VALIDATION (DOĞRULAMA) QAYDALARI:
 * 1. `@IsJWT()`: Gələn `idToken` sətrinin həqiqətən Google tərəfindən verilmiş JWT formatında olduğunu yoxlayır.
 * 2. `@IsNotEmpty()`: Tokenin boş və ya undefined olmamasını təmin edir.
 */
export class GoogleLoginDto {
  @IsJWT()
  @IsNotEmpty()
  idToken!: string;
}


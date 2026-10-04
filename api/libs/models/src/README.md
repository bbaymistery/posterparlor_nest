# 📦 Master Guide: `libs/models` (DTO vs Database Schema)

Salam əziz tələbəm! 👨‍🏫 Bu kitabxanada (`libs/models`) bizim NestJS layihəmizin **bütün məlumat modelləri** cəmləşib. NestJS-də ilk dəfə işləyərkən ən çox qarışdırılan iki əsas anlayış **DTO (Data Transfer Object)** və **Schema (Verilənlər Bazası Şeması)** anlayışlarıdır.

---

## ❓ 1. DTO Və Schema Arasındakı Fərq Nədir?

Gəl bu iki anlayışı sadə həyat analogiyası ilə başa düşək:

| Xüsusiyyət | 📩 DTO (Data Transfer Object) | 🗄️ Schema (Database Schema) |
| :--- | :--- | :--- |
| **Nədir?** | Brauzerdən (Client) Serverə gələn **GİRİŞ PASPORTUDUR**. | MongoDB Verilənlər Bazasının **SAXLANMA QUTUSUDUR**. |
| **Harada İşləyir?** | API Controller-ə məlumat gələndə **girişdə (ValidationPipe)**. | Service bazaya məlumat yazanda/oxuyanda **MongoDB-də**. |
| **Əsas Məqsədi?** | Gələn məlumatın tipini və təhlükəsizliyini yoxlamaq (`class-validator`). | Bazadakı sütunları, tipləri və əlaqələri təyin etmək (`@Prop`, `@Schema`). |
| **Nümunə** | `GoogleLoginDto`, `AddPosterDto`, `CreateOrderDto` | `UserSchema`, `PosterSchema`, `OrderSchema` |

---

## 🔬 2. Nümunə Üzərində Canlı Müqayisə: `UserDto` vs `UserSchema`

### 📩 A) DTO Nümunəsi (`GoogleLoginDto` — `libs/models/src/dto/user.dto.ts`):
İstifadəçi brauzerdən daxil olmaq istəyir. Brauzer serverə sadəcə Google-dan aldığı `idToken`-i göndərir:

```typescript
import { IsNotEmpty, IsJWT } from 'class-validator';

export class GoogleLoginDto {
  @IsJWT()
  @IsNotEmpty()
  idToken!: string;
}
```
👉 **DTO Nə Etdi?** Brauzerdən gelen sorğunu qapıda qarşıladı, `idToken`-in boş olmadığını və JWT formatında olduğunu yoxladı! Əgər şərtlər ödənməsə, controller-ə çatmadan 400 Bad Request qaytarır.

---

### 🗄️ B) Schema Nümunəsi (`User` — `libs/models/src/schema/user.schema.ts`):
Qapıdan keçən istifadəçi məlumatları doğrulandıqdan sonra MongoDB verilənlər bazasında necə saxlanacaq?

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // createdAt və updatedAt avtomatik əlavə edir
export class User {
  @Prop({ required: true, unique: true }) // Bazada təkrar olunmayan unikal email
  email!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ required: true })
  googleId!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
```
👉 **Schema Nə Etdi?** MongoDB-də `users` kolleksiyasını (cədvəlini) yaradır, `email`-in unikal olmasını, `createdAt`/`updatedAt` vaxtlarının avtomatik qoyulmasını təmin edir!

---

## 🔄 3. Məlumatın Tam İcra Zənciri (Flow)

```mermaid
graph LR
    A["1. Brauzer (HTTP POST /api/auth/google)"] -->|Gələn JSON: { idToken: '...' }| B["2. ValidationPipe & DTO (GoogleLoginDto)"]
    B -->|Doğrulama Uğurlu| C["3. AuthController & AuthService"]
    C -->|Məlumat Bazaya Yazılır| D["4. Mongoose Model & Schema (UserSchema)"]
    D -->|MongoDB-də Saxlanılır| E["5. MongoDB Collection: users"]
```

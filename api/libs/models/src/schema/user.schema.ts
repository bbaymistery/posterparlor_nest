import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * 🗄️ USER SCHEMA (MongoDB İstifadəçi Şeması)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * MongoDB verilənlər bazasında `users` kolleksiyasında (cədvəlində) istifadəçi
 * məlumatlarının hansı sütunlarla (sahələrlə) saxlanacağını müəyyən edir.
 */

// UserDocument — Mongoose-un daxili Document sinfi ilə bizim User sinfimizin birləşməsidir (Typescript tipi üçün)
export type UserDocument = User & Document;

// İstifadəçinin sistemdəki rolu (Standart İstifadəçi və ya Admin)
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// `@Schema({ timestamps: true })`: Bazada avtomatik `createdAt` (yaradılma vaxtı) və `updatedAt` (yenilənmə vaxtı) yaradır.
@Schema({ timestamps: true })
export class User {
  // `@Prop({ required: true, unique: true })`: Email mütləq doldurulmalıdır və bazada təkrar oluna bilməz!
  @Prop({ required: true, unique: true })
  email!: string;

  // İstifadəçinin adı və soyadı
  @Prop({ required: true })
  name!: string;

  // Rolu: Varsayılan olaraq 'USER' təyin edilir
  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  // İstifadəçinin hesabı aktivdirmi?
  @Prop({ default: true })
  isActive!: boolean;

  // Sonuncu dəfə sistemə daxil olduğu tarix
  @Prop({ default: null })
  lastLogin!: Date;

  // Google OAuth hesabının unikal ID-si
  @Prop({ required: true })
  googleId!: string;
}

// Mongoose üçün hazır Schema obyektini generasiya edirik
export const UserSchema = SchemaFactory.createForClass(User);


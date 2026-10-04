import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * 🗄️ POSTER SCHEMA (MongoDB Poster / Məhsul Şeması)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * MongoDB-də `posters` kolleksiyasında satılan posterlərin (ad, qiymət, şəkillər, stok, kateqoriya)
 * hansı struktura malik olacağını təyin edir.
 */
export type PosterDocument = Poster & Document;

export interface PosterImage {
  url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
}

@Schema({ timestamps: true, collection: 'posters' })
export class Poster {
  // Posterin adı
  @Prop({ required: true, trim: true })
  title!: string;

  // Qiyməti (mənfi ola bilməz: min: 0)
  @Prop({ required: true, min: 0 })
  price!: number;

  // Ölçüləri (Məsələn: "50x70 cm")
  @Prop({ required: true, trim: true })
  dimensions!: string;

  // Materialı (Məsələn: "Kətan kağız")
  @Prop({ trim: true })
  material?: string;

  // Cloudinary şəkillər massivi (ən azı 1 şəkil olmalıdır!)
  @Prop({
    type: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        format: { type: String },
        width: { type: Number },
        height: { type: Number },
      },
    ],
    required: true,
    validate: [
      (val: PosterImage[]) => val.length > 0,
      'At least one image is required',
    ],
  })
  images!: PosterImage[];

  // Satışda varmı? (İndekslənib ki, axtarış sürətli olsun)
  @Prop({ default: true, index: true })
  isAvailable!: boolean;

  // Kateqoriyası
  @Prop({ required: true, trim: true, index: true })
  category!: string;

  // Etiketlər (Tags)
  @Prop({ type: [String], default: [], index: true })
  tags!: string[];

  // Anbardakı sayı (Stok)
  @Prop({ required: true, min: 0, default: 0 })
  stock!: number;

  // Məhsul haqqında ətraflı təsvir (Mətn axtarışı 'text' indeksi ilə sürətləndirilib)
  @Prop({ trim: true, index: 'text' })
  description?: string;
}

export const PosterSchema = SchemaFactory.createForClass(Poster);

// 🔍 İNDEKLƏR (Database Indexes — Axtarışları 100x Sürətləndirir)
// 1. Unikal title indeksi (Eyni adlı iki poster ola bilməz)
PosterSchema.index({ title: 1 }, { unique: true });

// 2. Full-Text Search İndeksi (Ad, təsvir və etiketlərdə axtarış üçün)
PosterSchema.index({ title: 'text', description: 'text', tags: 'text' });

// 3. Filtrləmə indeksləri (Kateqoriya və stok üzrə filtrlər üçün)
PosterSchema.index({ category: 1, isAvailable: 1 });
PosterSchema.index({ stock: 1, isAvailable: 1 });


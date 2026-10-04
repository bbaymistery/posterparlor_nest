import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * 🗄️ REVIEW SCHEMA (MongoDB Rəy Və Qiymətləndirmə Şeması)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * İstifadəçilərin posterlərə yazdığı rəyləri, ulduz ballarını (1-5) və şəkilləri bazada saxlayır.
 */
export type ReviewDocument = Review & Document;

export interface ReviewImage {
  url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
}

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  // Rəy yazan istifadəçinin ID-si (User kolleksiyası ilə əlaqəlidir: ref: 'User')
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: string;

  // Haqqında rəy yazılan posterin ID-si (Poster kolleksiyası ilə əlaqəlidir: ref: 'Poster')
  @Prop({ type: Types.ObjectId, ref: 'Poster', required: true })
  posterId!: string;

  // Qiymətləndirmə balı (1-5 arası ədəd)
  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  // Rəy mətni
  @Prop({ trim: true })
  comment?: string;

  // Əlavə olunmuş şəkillər
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
  })
  images?: ReviewImage[];
}

export const ReviewSchema = SchemaFactory.createForClass(Review);


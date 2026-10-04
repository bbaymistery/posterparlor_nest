import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * 🗄️ ORDER SCHEMA (MongoDB Sifarişlər Şeması)
 * 
 * 💡 NƏ İŞƏ YARIYIR?
 * Müştərilərin verdiyi bütün sifarişləri (alınan posterlər, çatdırılma ünvanı, ödəniş statusu, yekun qiymət)
 * MongoDB `orders` kolleksiyasında saxlayır.
 */
export type OrderDocument = Order & Document;

// Sifarişin mərhələ statusları
export enum OrderStatus {
  PENDING = 'PENDING',        // Gözləmədədir
  PROCESSING = 'PROCESSING',  // Hazırlanır
  SHIPPED = 'SHIPPED',        // Karqoya verildi
  DELIVERED = 'DELIVERED',    // Çatdırıldı
  CANCELLED = 'CANCELLED',    // Ləğv edildi
}

export interface OrderItem {
  posterId: Types.ObjectId | string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentDetails {
  method: string;
  transactionId: string;
  amount: number;
  currency: string;
}

export interface CustomerInfo {
  userId: Types.ObjectId | string;
  name: string;
  email?: string;
  phone: string;
}

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  // Müştəri məlumatları
  @Prop({
    required: true,
    type: {
      userId: { type: Types.ObjectId, ref: 'User' },
      name: String,
      email: String,
      phone: String,
    },
  })
  customer!: CustomerInfo;

  // Sifariş olunan məhsullar (Posterlər massivi)
  @Prop({
    required: true,
    type: [
      {
        posterId: { type: Types.ObjectId, ref: 'Poster', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
  })
  items!: OrderItem[];

  // Çatdırılma ünvanı
  @Prop({
    required: true,
    type: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  })
  shippingAddress!: ShippingAddress;

  // Ödəniş təfərrüatları
  @Prop({
    required: true,
    type: {
      method: String,
      transactionId: String,
      amount: Number,
      currency: { type: String, default: 'USD' },
    },
  })
  paymentDetails!: PaymentDetails;

  // Sifariş statusu
  @Prop({
    required: true,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    index: true,
  })
  status!: OrderStatus;

  // Ödəniş olunubmu?
  @Prop({ default: false })
  isPaid!: boolean;

  // Çatdırılma haqqı
  @Prop({ required: true, min: 0 })
  shippingCost!: number;

  // Vergi məbləği
  @Prop({ required: true, min: 0 })
  taxAmount!: number;

  // Yekun cəmi qiymət
  @Prop({ required: true, min: 0 })
  totalPrice!: number;

  // Kargo izləmə nömrəsi
  @Prop({ type: String })
  trackingNumber?: string;

  // Xüsusi qeydlər
  @Prop({ type: String })
  notes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// 🔍 Axtarış indeksləri
OrderSchema.index({ 'customer.userId': 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'paymentDetails.transactionId': 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ isPaid: 1, createdAt: -1 });


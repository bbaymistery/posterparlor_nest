import { IsArray, IsBoolean, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsPostalCode, IsString, Min, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../schema/order.schema';

/**
 * 🛒 ORDER ITEM DTO (Sifarişdəki Hər Bir Poster)
 */
export class OrderItemDto {
  @IsMongoId()
  @IsNotEmpty()
  posterId!: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity!: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price!: number;
}

/**
 * 🚚 SHIPPING ADDRESS DTO (Çatdırılma Ünvanı)
 */
export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  addressLine1!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  pincode!: string;
}

/**
 * 💳 PAYMENT DETAILS DTO (Ödəniş Məlumatları)
 */
export class PaymentDetailsDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['ONLINE', 'COD', 'STRIPE'])
  method!: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsOptional()
  @IsIn(['USD', 'usd', 'USD$', '$'])
  currency?: string = 'USD';
}

/**
 * 👤 CUSTOMER INFO DTO (Müştəri Məlumatları)
 */
export class CustomerInfoDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;
}

/**
 * 📦 CREATE ORDER DTO (Yeni Sifariş Yaradılması DTO-su)
 */
export class CreateOrderDto {
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  @IsOptional()
  customer?: CustomerInfoDto;

  @IsMongoId()
  @IsOptional()
  userId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items!: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress!: ShippingAddressDto;

  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  @IsNotEmpty()
  paymentDetails!: PaymentDetailsDto;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPrice?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  paymentIntentId?: string;
}

/**
 * 💳 INITIATE PAYMENT DTO (Ödəniş Başlatma DTO-su)
 */
export class InitiatePaymentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items!: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress!: ShippingAddressDto;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  shippingCost!: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  taxAmount!: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  totalPrice!: number;

  @IsString()
  @IsOptional()
  currency?: string;
}

/**
 * 🛡️ VERIFY PAYMENT DTO (Ödənişin Doğrulanması DTO-su)
 */
export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentIntentId!: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  @IsOptional()
  customer?: CustomerInfoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items!: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  @IsNotEmpty()
  shippingAddress!: ShippingAddressDto;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  shippingCost!: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  taxAmount!: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  totalPrice!: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  sandbox?: boolean;
}


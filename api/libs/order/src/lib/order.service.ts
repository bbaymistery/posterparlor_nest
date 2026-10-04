import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { Order, OrderDocument, Poster, User, PosterDocument, UserDocument, CreateOrderDto, OrderStatus, } from '@new-poster-parlor-api/models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginatedOrdersResponse } from '@new-poster-parlor-api/shared';

/**
 * 🛒 ORDERS SERVICE (Sifariş Və Stok Biznes Loqikası)
 * 
 * Müəllim izahı:
 * Bu servis sifarişlərin yaradılmasını, qiymət və stok doğrulanmasını,
 * istifadəçinin sifariş tarixçəsinin gətirilməsini və stok sayının avtomatik azaldılmasını idarə edir.
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Poster.name) private readonly posterModel: Model<PosterDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) { }

  /**
   * Köməkçi: MongoDB ObjectId validasiyası (24 hex simvol)
   */
  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * 1️⃣ `validateOrderItems(items)`: Sifarişdəki posterləri bazadan tapıb stoku və qiyməti doğrulayır
   */
  public async validateOrderItems(items: { posterId: string; quantity: number; price: number }[]): Promise<{
    validatedItems: { posterId: string; quantity: number; price: number }[];
    subtotal: number;
  }> {
    if (!items || items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    if (items.some((item) => !this.isValidObjectId(item.posterId))) {
      throw new BadRequestException('Invalid poster ID format');
    }

    let subtotal = 0;
    const validatedItems: { posterId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const poster = await this.posterModel.findById(item.posterId).lean();
      if (!poster) {
        throw new NotFoundException(`Poster with ID ${item.posterId} not found`);
      }

      // Stok bəs edirmi?
      if (poster.stock !== undefined && poster.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for poster "${poster.title}". Available: ${poster.stock}, Requested: ${item.quantity}`
        );
      }

      // Qiymət fırıldağının qarşısını almaq üçün baza qiyməti ilə müqayisə edirik
      if (Math.abs(item.price - poster.price) > 0.01) {
        throw new BadRequestException(
          `Price mismatch for poster "${poster.title}". Expected: ${poster.price}, Received: ${item.price}`
        );
      }

      validatedItems.push({
        posterId: item.posterId,
        quantity: item.quantity,
        price: poster.price,
      });

      subtotal += poster.price * item.quantity;
    }

    return { validatedItems, subtotal };
  }

  /**
   * 2️⃣ `createOrder(orderDetail, paymentInfo)`: Sifarişi yaradır, MongoDB-də saxlayır və stoku azaldır
   */
  public async createOrder(orderDetail: CreateOrderDto, paymentInfo?: { paymentIntentId?: string }): Promise<OrderDocument> {
    if (
      (orderDetail.userId && !this.isValidObjectId(orderDetail.userId)) ||
      orderDetail.items?.some((item) => !this.isValidObjectId(item.posterId))
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    // Sifariş məhsullarını və qiymətlərini yoxlayırıq
    const { validatedItems, subtotal } = await this.validateOrderItems(orderDetail.items);

    // Müştəri məlumatları (User daxil olubsa profilindən doldurulur)
    let customerInfo: {
      userId?: string;
      name: string;
      email?: string;
      phone?: string;
    } | null = null;

    if (orderDetail.userId) {
      const user = await this.userModel.findById(orderDetail.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      customerInfo = {
        userId: orderDetail.userId,
        name: orderDetail.customer?.name || user.name,
        email: orderDetail.customer?.email || user.email,
        phone: orderDetail.customer?.phone || '',
      };
    } else if (orderDetail.customer) {
      customerInfo = {
        name: orderDetail.customer.name,
        email: orderDetail.customer.email,
        phone: orderDetail.customer.phone,
      };
    }

    // Çatdırılma haqqı və Vergi hesablanması
    const shippingCost =
      orderDetail.shippingCost ??
      this.calculateShipping(subtotal, orderDetail.shippingAddress.state);

    const taxAmount = orderDetail.taxAmount ?? this.calculateTax(subtotal);

    const totalPrice =
      orderDetail.totalPrice ?? subtotal + shippingCost + taxAmount;

    // Ödəniş details
    const paymentDetails = {
      ...orderDetail.paymentDetails,
      transactionId:
        paymentInfo?.paymentIntentId ||
        orderDetail.paymentDetails.transactionId ||
        '',
    };

    // 💾 MongoDB Sifariş Sənədini yaradırıq
    const order = new this.orderModel({
      customer: customerInfo,
      items: validatedItems,
      shippingAddress: orderDetail.shippingAddress,
      paymentDetails,
      status: orderDetail.status || OrderStatus.PENDING,
      isPaid:
        orderDetail.isPaid ?? orderDetail.paymentDetails.method !== 'COD',
      shippingCost,
      taxAmount,
      totalPrice,
      notes: orderDetail.notes,
    });

    const savedOrder = await order.save();
    if (!savedOrder) {
      throw new BadRequestException('Failed to create order');
    }

    // 📉 Anbardakı stok sayını satılan miqdar qədər azaldırıq ($inc: -quantity)
    for (const item of validatedItems) {
      await this.posterModel.findByIdAndUpdate(item.posterId, {
        $inc: { stock: -item.quantity },
      });
    }

    return savedOrder;
  }

  /**
   * 3️⃣ `getOrdersByUserId(userId, page, limit)`: İstifadəçinin öz sifariş tarixçəsini səhifələmə ilə gətirir
   */
  public async getOrdersByUserId(userId: string, page = 1, limit = 10): Promise<PaginatedOrdersResponse> {
    if (!this.isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;

    const [orders, totalOrders] = await Promise.all([
      this.orderModel
        .find({ 'customer.userId': userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validLimit)
        .lean()
        .exec(),
      this.orderModel.countDocuments({ 'customer.userId': userId }).exec(),
    ]);

    const totalPages = Math.ceil(totalOrders / validLimit);

    return {
      orders,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalOrders,
        limit: validLimit,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      },
    };
  }

  /**
   * 4️⃣ `getOrderById(orderId, userId)`: Tək bir sifarişi ID üzrə tapır və içindəki Poster məlumatlarını populate edir
   */
  public async getOrderById(orderId: string, userId?: string): Promise<OrderDocument> {
    if (!this.isValidObjectId(orderId)) {
      throw new BadRequestException('Invalid order ID format');
    }

    const order = await this.orderModel
      .findById(orderId)
      .populate({
        path: 'items.posterId',
        model: 'Poster',
        select: 'title images dimensions material category',
      })
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (userId && order.customer?.userId?.toString() !== userId) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  /**
   * 5️⃣ `getAllOrders(page, limit)`: Bütün sifarişləri admin üçün gətirir
   */
  public async getAllOrders(page = 1, limit = 10): Promise<PaginatedOrdersResponse> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;

    const totalOrders = await this.orderModel.countDocuments().exec();
    const orders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(validLimit)
      .exec();

    const totalPages = Math.ceil(totalOrders / validLimit);

    return {
      orders,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalOrders,
        limit: validLimit,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      },
    };
  }

  /**
   * 6️⃣ `updateOrderStatus(orderId, status)`: Sifarişin statusunu yeniləyir (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
   */
  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderDocument> {
    if (!this.isValidObjectId(orderId)) {
      throw new BadRequestException('Invalid order ID format');
    }

    const order = await this.orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  // Çatdırılma və Vergi Hesablama köməkçiləri
  private calculateShipping(subtotal: number, state: string): number {
    const baseShipping = 10;
    const freeShippingThreshold = 100;
    const shipping = subtotal >= freeShippingThreshold ? 0 : baseShipping;
    return shipping;
  }

  private calculateTax(subtotal: number): number {
    // 10% Standart Vergi
    return Math.round(subtotal * 0.10);
  }
}

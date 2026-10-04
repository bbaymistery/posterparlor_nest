import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateOrderDto, InitiatePaymentDto, VerifyPaymentDto, OrderStatus, UserRole } from '@new-poster-parlor-api/models';
import { Auth, CurrentUser } from '@new-poster-parlor-api/auth';
import type { AuthenticatedUser } from '@new-poster-parlor-api/shared';
import { OrdersService } from './order.service';
import { PaymentService } from './payment.service';
import { HttpResponseUtil, BadRequestException } from '@new-poster-parlor-api/utils';

/**
 * 🛒 ORDERS CONTROLLER (Sifariş Və Ödəniş Marşrutları Giriş Qapısı)
 * 
 * Müəllim izahı:
 * Bu controller müştərilərin posterləri sifariş etməsini, Stripe Sandbox ilə ödəniş başlatmasını,
 * ödənişin doğrulanaraq bazaya saxlanmasını və sifariş tarixçəsinin gətirilməsini idarə edir.
 */
@Controller('order')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentService: PaymentService
  ) { }

  /**
   * 🔑 1. `GET /api/order/payment/key`: Frontend üçün Stripe Publishable Key-i (pk_test_...) qaytarır
   */
  @Get('payment/key')
  @Auth()
  getPaymentKey() {
    const publishableKey = this.paymentService.getPublishableKey();
    return HttpResponseUtil.success({ publishableKey }, 'Stripe publishable key fetched');
  }

  /**
   * 💳 2. `POST /api/order/payment/initiate`: Stripe-da PaymentIntent yaradır
   */
  @Post('payment/initiate')
  @Auth()
  async initiatePayment(
    @Body() dto: InitiatePaymentDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    // 1. Sifarişdəki məhsulların qiymətlərini və stokunu doğrula
    const validatedPricing = await this.ordersService.validateOrderItems(dto.items);

    // 2. Məbləği sentə (cents) çeviririk ($29.99 = 2999 cents)
    const amountInCents = Math.round(dto.totalPrice * 100);

    // 3. Stripe PaymentIntent yaradırıq
    const paymentIntent = await this.paymentService.createPaymentIntent({
      amount: amountInCents,
      currency: dto.currency || 'usd',
      receipt: `ord_${user.id.slice(-8)}_${Date.now().toString(36)}`,
      metadata: {
        userId: user.id,
        itemCount: String(dto.items.length),
        subtotal: String(validatedPricing.subtotal),
      },
    });

    return HttpResponseUtil.success(
      {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        publishableKey: this.paymentService.getPublishableKey(),
      },
      'Stripe PaymentIntent created successfully'
    );
  }

  /**
   * 🛡️ 3. `POST /api/order/payment/verify`: Stripe ödənişini doğrulayıb sifarişi bazada yaradır
   */
  @Post('payment/verify')
  @Auth()
  async verifyPaymentAndCreateOrder(
    @Body() dto: VerifyPaymentDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    // Stripe-dan ödəniş statusunu yoxlayırıq (dto.sandbox parametri ilə test və ya canlı rejim tənzimlənir)
    const verification = await this.paymentService.verifyPaymentIntent(
      dto.paymentIntentId,
      dto.sandbox
    );

    if (!verification.isValid) {
      throw new BadRequestException('Payment verification failed. Stripe payment not completed.');
    }

    // Sifarişi bazada yaradırıq
    const orderData: CreateOrderDto = {
      userId: user.id,
      customer: dto.customer,
      items: dto.items,
      shippingAddress: dto.shippingAddress,
      paymentDetails: {
        method: 'STRIPE',
        amount: dto.totalPrice,
        currency: dto.currency || 'USD',
        transactionId: dto.paymentIntentId,
      },
      status: OrderStatus.PROCESSING,
      isPaid: true,
      shippingCost: dto.shippingCost,
      taxAmount: dto.taxAmount,
      totalPrice: dto.totalPrice,
      notes: dto.notes,
      paymentIntentId: dto.paymentIntentId,
    };

    const order = await this.ordersService.createOrder(orderData, {
      paymentIntentId: dto.paymentIntentId,
    });

    return HttpResponseUtil.success(order, 'Payment verified and order created successfully');
  }

  /**
   * 📦 4. `POST /api/order`: Birbaşa sifariş yaratmaq (COD / Nağd ödəniş üçün)
   */
  @Post()
  @Auth()
  async createOrder(
    @Body() orderDetail: CreateOrderDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (user) {
      orderDetail.userId = user.id;
    }
    const order = await this.ordersService.createOrder(orderDetail);
    return HttpResponseUtil.success(order, 'Order created successfully');
  }

  /**
   * 📜 5. `GET /api/order`: Giriş etmiş istifadəçinin öz sifariş tarixçəsini gətirir
   */
  @Get()
  @Auth()
  async getUserOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.ordersService.getOrdersByUserId(user.id, pageNum, limitNum);
    return HttpResponseUtil.success(result, 'User orders fetched successfully');
  }

  /**
   * 👑 6. `GET /api/order/admin/all`: Bütün sifarişləri admin üçün gətirir
   */
  @Get('admin/all')
  @Auth(UserRole.ADMIN)
  async getAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.ordersService.getAllOrders(pageNum, limitNum);
    return HttpResponseUtil.success(result, 'All orders fetched successfully');
  }

  /**
   * 🔍 7. `GET /api/order/:id`: Tək bir sifarişin detallarını gətirir
   */
  @Get(':id')
  @Auth()
  async getOrderById(
    @Param('id') orderId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const order = await this.ordersService.getOrderById(orderId, user.id);
    return HttpResponseUtil.success(order, 'Order fetched successfully');
  }

  /**
   * 👑 8. `PUT /api/order/admin/:id/status`: Admin sifarişin statusunu yeniləyir
   */
  @Put('admin/:id/status')
  @Auth(UserRole.ADMIN)
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body('status') status: OrderStatus
  ) {
    const updatedOrder = await this.ordersService.updateOrderStatus(orderId, status);
    return HttpResponseUtil.success(updatedOrder, 'Order status updated successfully');
  }
}

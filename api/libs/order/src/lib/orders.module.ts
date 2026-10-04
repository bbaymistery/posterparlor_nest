import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema, Poster, PosterSchema, User, UserSchema, } from '@new-poster-parlor-api/models';
import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';
import { PaymentService } from './payment.service';

/**
 * 📦 ORDER MODULE (Sifariş Və Ödəniş Modulu)
 * 
 * Müəllim izahı:
 * Bu modul Order, Poster və User Mongoose modellərini bağlayır,
 * OrdersController, OrdersService və Stripe PaymentService-i bir yerə toplayır.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Poster.name, schema: PosterSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PaymentService],
  exports: [OrdersService, PaymentService],
})
export class OrderModule { }

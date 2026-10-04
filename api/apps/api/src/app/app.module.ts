import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from '@new-poster-parlor-api/logger';
import { AppConfigModule } from '@new-poster-parlor-api/config';
import { DatabaseModule } from '@new-poster-parlor-api/database';
import { AuthModule } from '@new-poster-parlor-api/auth';
import { InventoryModule } from '@new-poster-parlor-api/inventory';
import { ReviewModule } from '@new-poster-parlor-api/review';
import { AdminModule } from '@new-poster-parlor-api/admin';
import { OrderModule } from '@new-poster-parlor-api/order';
@Module({
  imports: [
    LoggerModule, AppConfigModule, DatabaseModule,
    AuthModule, InventoryModule, ReviewModule, AdminModule, OrderModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

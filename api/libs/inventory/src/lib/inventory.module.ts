import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Poster, PosterSchema } from '@new-poster-parlor-api/models';
import { InventoryController } from './inventory.controller';
import { CloudinaryService } from './cloudinary.service';
import { InventoryService } from './inventory.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Poster.name, schema: PosterSchema }]),
	],
	controllers: [InventoryController],
	providers: [CloudinaryService, InventoryService],
	exports: [CloudinaryService, InventoryService],
})
export class InventoryModule { }

import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '@new-poster-parlor-api/config';
import { buildMongoConfig } from './database.config';
import { setUpMongoDbConnection } from './database.connection';
import { Connection } from 'mongoose';
import { DatabaseController } from './database.controller';
import { DatabaseHealthService } from './database.service';
@Module({
	imports: [
		ConfigModule,
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [AppConfigService],
			useFactory: async (appConfig: AppConfigService) => {
				return {
					...buildMongoConfig(appConfig),
					connectionFactory: (connection: Connection) =>
						setUpMongoDbConnection(
							connection,
							appConfig.dbConfig.dbname,
							appConfig.isProduction
						),
				};
			},
		}),
	],
	controllers: [DatabaseController],
	providers: [DatabaseHealthService],
	exports: [MongooseModule],
})
export class DatabaseModule implements OnModuleInit {
	private readonly logger = new Logger(DatabaseModule.name);
	async onModuleInit() {
		{
			this.logger.log('Database Module Initialized');
		}
	}
}

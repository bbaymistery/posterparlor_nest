import { Logger } from '@nestjs/common';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { AppConfigService } from '@new-poster-parlor-api/config';

export function buildMongoConfig(config: AppConfigService): MongooseModuleFactoryOptions {
    const logger = new Logger('DatabaseConfig');

    const dburl = config.dbConfig.dburl;

    const dbname = config.dbConfig.dbname;

    if (!dburl) throw new Error('Database url is missing');
    if (!dbname) throw new Error('Database name is missing');

    const isProduction = config.isProduction;

    const poolSize = config.dbConfig.poolsize;

    const minPoolSize = Math.floor(poolSize * 0.2);

    logger.log(`Connecting to ${dbname} at ${dburl.replace(/\/\/.*:.*@/, '//***:***@')}`);

    return {
        uri: dburl,
        dbName: dbname,

        serverSelectionTimeoutMS: isProduction ? 30000 : 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,

        maxPoolSize: poolSize,
        minPoolSize: minPoolSize,

        retryAttempts: 5,
        retryDelay: 2000,

        autoIndex: !isProduction,
        autoCreate: !isProduction,

        tls: isProduction || dburl.startsWith('mongodb+srv://'),
        tlsAllowInvalidCertificates: false,

        readPreference: 'primaryPreferred',
        w: 'majority',
        journal: true,

        compressors: ['zlib'],
        zlibCompressionLevel: 6,
    };
}

import { Logger } from '@nestjs/common';
import { Connection } from 'mongoose';
import { registerQueryMonitoring } from './database.monitoring';

export function setUpMongoDbConnection(connection: Connection, dbname: string, isProduction: boolean) {
    const logger = new Logger('MongoConnection');

    connection.on('connected', () => logger.log(`MongoDB connected to ${dbname}`));
    connection.on('disconnected', () => logger.log(`MongoDB disconnected from ${dbname}`));
    connection.on('reconnected', () => logger.log(`MongoDB is reconnected to ${dbname}`));
    connection.on('error', (err) => logger.log(`MongoDB connection error:  ${err.message}`));
    connection.on('close', () => logger.log(`MongoDB connection close`));

    if (isProduction) registerQueryMonitoring(connection, logger);

    return connection;
}

import { Logger } from '@nestjs/common';
import { Connection } from 'mongoose';

export function registerQueryMonitoring(connection: Connection, logger: Logger) {
    const querryTime = new Map<string, number>();

    connection.on('commandStarted', (event) => {
        const operations = ['find', 'aggregate', 'delete', 'update', 'insert'];
        if (operations.includes(event.commandName)) {
            querryTime.set(event.requestId.toString(), Date.now());
        }
    });

    connection.on('commandSucceded', (event) => {
        const req = event.requestId.toString();
        const start = querryTime.get(req);

        if (start) {
            const duration = Date.now() - start;
            querryTime.delete(req);

            if (duration > 1000) {
                logger.warn(`Slow querry detected: ${event.commandName} took ${duration}ms`);
            }
        }
    });
    connection.on('commandFailed', (event) => {
        querryTime.delete(event.requestId.toString());

        logger.error(`Querry failed: ${event.commandName} | ${event.failure}`);
    });
}

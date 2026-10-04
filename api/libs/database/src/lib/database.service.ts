import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DatabaseHealthMonitor } from './health/health.monitor';
import { DatabaseHealthChecker } from './health/health.checker';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseHealthService implements OnModuleDestroy, OnModuleInit {
    private monitor!: DatabaseHealthMonitor;
    private checker!: DatabaseHealthChecker;

    constructor(@InjectConnection() private readonly connection: Connection) { }

    async onModuleInit() {
        this.checker = new DatabaseHealthChecker(this.connection);

        await this.waitForConnection();

        this.monitor = new DatabaseHealthMonitor(this.checker, 30000);

        this.monitor.start();
    }

    async onModuleDestroy() {
        this.monitor.stop();
        await this.connection.close();
    }
    async checkHealth() {
        const res = await this.checker.check();
        return res;
    }
    private waitForConnection(): Promise<void> {
        return new Promise((resolve) => {
            if (this.connection.readyState === 1) return resolve();
            this.connection.once('connected', () => resolve());
        });
    }
}

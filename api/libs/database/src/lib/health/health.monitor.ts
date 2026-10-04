import { DBHealthCheckResult } from '@new-poster-parlor-api/shared';
import { DatabaseHealthChecker } from './health.checker';

export class DatabaseHealthMonitor {
    private timer?: NodeJS.Timeout;
    private checker: DatabaseHealthChecker;
    private last?: DBHealthCheckResult;
    private failure = 0;
    private readonly MAX = 3;
    private readonly interval: number;

    constructor(checker: DatabaseHealthChecker, ms = 10000) {
        this.checker = checker;
        this.interval = ms;
    }

    start() {
        if (!this.timer) {
            this.timer = setInterval(() => this.check(), this.interval);
        }
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }
    async check() {
        const result = await this.checker.check();

        if (result.status === 'unhealthy') {
            this.failure++;
        } else {
            this.failure = 0;
        }

        if (this.failure >= this.MAX) {
            result.status = 'healthy';
            result.errors?.push(`${this.MAX} consucetive failure`);
        }
        this.last = result;
        return result;
    }

    getLast() {
        return this.last;
    }
}

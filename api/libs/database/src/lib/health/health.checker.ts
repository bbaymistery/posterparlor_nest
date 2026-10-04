import { DBHealthCheckResult, DBHealthMetrics } from '@new-poster-parlor-api/shared';
import { Connection } from 'mongoose';

export class DatabaseHealthChecker {
    constructor(private readonly connection: Connection) { }

    async check(): Promise<DBHealthCheckResult> {
        const isConnected = this.connection.readyState === 1;

        let latency: number | undefined;
        let version: string | undefined;
        const errors: string[] = [];

        if (isConnected) {
            try {
                const pingSatrt = Date.now();

                const admin = this.connection.db?.admin();
                const info = await admin?.serverInfo();

                version = info?.['version'];

                latency = Date.now() - pingSatrt;
            } catch (error) {
                errors.push((error as Error).message);
            }
        }

        const metrics: DBHealthMetrics = {
            isConnected,

            readyState: this.stateText(this.connection.readyState),
            host: this.connection.host,
            port: this.connection.port,
            dbName: this.connection.name,
            serverVersion: version,
            latency,
            lastChecked: new Date(),
        };
        const status = this.resolveStatus(isConnected, latency, errors);

        return { status, metrics, errors, };
    }

    private stateText(code: number): string {
        return (({ 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting', 99: 'uninitilized', } as Record<number, string>)[code] ?? 'unknown'
        );
    }

    private resolveStatus(connected: boolean, latency?: number, errors?: string[]) {
        if (!connected) return 'unhealthy';
        if (latency && latency > 1000) return 'degraded';
        if (errors?.length) return 'degraded';
        return 'healthy';
    }
}

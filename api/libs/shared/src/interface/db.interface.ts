export interface DBHealthMetrics {
  isConnected: boolean;
  readyState: string;

  host: string;
  port: number;
  dbName: string;
  serverVersion?: string;
  latency?: number;
  lastChecked: Date;
}

export type HealthStatus = 'healthy' | 'unhealthy' | 'degraded';
export interface DBHealthCheckResult {
  status: HealthStatus;
  metrics: DBHealthMetrics;
  errors: string[];
}

import { Controller, Get } from '@nestjs/common';
import { DatabaseHealthService } from './database.service';
import { Public } from '@new-poster-parlor-api/auth'
@Controller('db-health')
export class DatabaseController {
    constructor(private readonly databaseHealthService: DatabaseHealthService) { }

    /**
     * 💡 Database Health Check Endpoint.
     * `main.ts`-də JwtAuthGuard qlobal təyin edildiyi üçün bütün marşrutlar susmaya görə qorunur.
     * Baza səhhətini yoxlamaq üçün bu endpoint login olmadan daxil oluna bilinsin deyə @Public() əlavə edildi.
     */
    @Get()
    @Public()
    async healthCheck() {
        const res = await this.databaseHealthService.checkHealth();
        return res;
    }
}

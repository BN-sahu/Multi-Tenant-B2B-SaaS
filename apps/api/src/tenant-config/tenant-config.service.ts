import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TenantConfigService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  constructor(private db: DatabaseService) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async getTheme(tenantId: string) {
    const cacheKey = `tenant:${tenantId}:theme`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const tenantDb = await this.db.getTenantDb(tenantId);
    
    // In a real scenario, this would query a tenant_themes table
    // For now, we mock a default configuration response
    const config = { primaryColor: '#000000', secondaryColor: '#ffffff' };
    
    // Cache for 1 hour
    await this.redis.set(cacheKey, JSON.stringify(config), 'EX', 3600);

    return config;
  }

  async updateTheme(tenantId: string, theme: any) {
    const cacheKey = `tenant:${tenantId}:theme`;
    
    // In a real scenario, this would update the tenant_themes table
    
    // Invalidate cache immediately on update
    await this.redis.del(cacheKey);
    return { success: true };
  }

  onModuleInit() {}

  onModuleDestroy() {
    this.redis.disconnect();
  }
}

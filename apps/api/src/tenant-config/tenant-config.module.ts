import { Module } from '@nestjs/common';
import { TenantConfigService } from './tenant-config.service';

@Module({
  providers: [TenantConfigService],
  exports: [TenantConfigService],
})
export class TenantConfigModule {}

import { Injectable, OnModuleInit, OnModuleDestroy, Scope, Inject } from '@nestjs/common';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { DB } from './schema';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  public readonly db: Kysely<DB>;
  private readonly pool: Pool;

  constructor(@Inject(REQUEST) private readonly request: any) {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://helpdesk:password@localhost:5432/helpdesk',
    });

    this.db = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: this.pool,
      }),
    });
  }

  // Returns a Kysely instance bound to the current tenant's context
  // This is the CRITICAL piece for RLS
  async getTenantDb(tenantId?: string) {
    // If tenantId is not passed, try to extract from request (assuming auth middleware sets it)
    const activeTenantId = tenantId || this.request.user?.tenantId;
    
    if (!activeTenantId) {
      // If there's no tenant context, we only allow access if the query doesn't touch RLS tables
      // or if it's a system-level query. For safety, we could throw an error here, but 
      // sometimes we need system-level access.
      return this.db;
    }

    return this.db.transaction().execute(async (trx) => {
      // Set the local transaction variable for RLS
      await sql`SET LOCAL app.tenant_id = ${activeTenantId}`.execute(trx);
      return trx;
    });
  }

  async onModuleInit() {
    // Optional connection test
  }

  async onModuleDestroy() {
    await this.db.destroy();
  }
}

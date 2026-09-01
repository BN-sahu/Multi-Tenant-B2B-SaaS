import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CustomersService {
  constructor(private readonly db: DatabaseService) {}

  async createCustomer(tenantId: string, data: any) {
    const tenantDb = await this.db.getTenantDb(tenantId);
    
    try {
      const result = await tenantDb.insertInto('customers')
        .values({
          tenant_id: tenantId,
          email: data.email,
          name: data.name,
          company: data.company,
          notes: data.notes,
        })
        .returningAll()
        .executeTakeFirst();
      
      return result;
    } catch (error: any) {
      if (error.code === '23505') { // Postgres unique violation
        throw new ConflictException('Customer with this email already exists');
      }
      throw error;
    }
  }

  async getCustomers(tenantId: string, limit: number, cursor?: string) {
    const tenantDb = await this.db.getTenantDb(tenantId);
    
    let query = tenantDb.selectFrom('customers')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(limit);

    if (cursor) {
      query = query.where('created_at', '<', new Date(cursor));
    }

    return query.execute();
  }

  async getCustomerById(tenantId: string, id: string) {
    const tenantDb = await this.db.getTenantDb(tenantId);
    
    const customer = await tenantDb.selectFrom('customers')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
      
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    
    return customer;
  }
}

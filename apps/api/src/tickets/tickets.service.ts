import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TicketsService {
  constructor(private readonly db: DatabaseService) {}

  async createTicket(tenantId: string, data: any) {
    const tenantDb = await this.db.getTenantDb(tenantId);
    
    // We don't need to specify tenantId in the insert because RLS allows it 
    // BUT we must insert it because the table requires it and RLS WITH CHECK enforces it matches.
    const result = await tenantDb.insertInto('tickets')
      .values({
        tenant_id: tenantId,
        subject: data.subject,
        description: data.description,
        customer_id: data.customerId,
        priority: data.priority,
      })
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async getTickets(tenantId: string, limit: number, cursor?: string) {
    const tenantDb = await this.db.getTenantDb(tenantId);
    
    let query = tenantDb.selectFrom('tickets')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(limit);

    if (cursor) {
      // Basic cursor pagination example based on created_at
      query = query.where('created_at', '<', new Date(cursor));
    }

    const tickets = await query.execute();
    return tickets;
  }

  async getTicketById(tenantId: string, id: string) {
    const tenantDb = await this.db.getTenantDb(tenantId);
    
    const ticket = await tenantDb.selectFrom('tickets')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
      
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    
    return ticket;
  }

  async updateTicket(tenantId: string, id: string, data: any) {
    const tenantDb = await this.db.getTenantDb(tenantId);
    
    // Optistic locking can be added here if needed.
    const result = await tenantDb.updateTable('tickets')
      .set(data)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
      
    if (!result) {
      throw new NotFoundException('Ticket not found or no permission to update');
    }
    return result;
  }

  async deleteTicket(tenantId: string, id: string) {
    const tenantDb = await this.db.getTenantDb(tenantId);
    
    const result = await tenantDb.deleteFrom('tickets')
      .where('id', '=', id)
      .returning('id')
      .executeTakeFirst();
      
    if (!result) {
      throw new NotFoundException('Ticket not found or no permission to delete');
    }
    
    return { deleted: true, id };
  }
}

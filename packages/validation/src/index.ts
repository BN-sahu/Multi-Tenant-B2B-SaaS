import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(255),
  description: z.string().min(1, 'Description is required'),
  customerId: z.string().uuid(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
});

export const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  assignedAgentId: z.string().uuid().optional(),
});

export const createCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  company: z.string().optional(),
  notes: z.string().optional(),
});

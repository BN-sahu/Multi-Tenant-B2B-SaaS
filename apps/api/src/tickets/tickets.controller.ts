import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createTicketSchema, updateTicketSchema } from '@helpdesk/validation';

@Controller('api/v1/tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles('Admin', 'Agent') // Viewers cannot create tickets usually, or maybe customers can. Let's assume standard internal agents.
  async createTicket(@Body(new ZodValidationPipe(createTicketSchema)) body: any, @Request() req: any) {
    return this.ticketsService.createTicket(req.user.tenantId, body);
  }

  @Get()
  @Roles('Admin', 'Agent', 'Viewer')
  async getTickets(@Request() req: any, @Query('limit') limit: number = 50, @Query('cursor') cursor?: string) {
    return this.ticketsService.getTickets(req.user.tenantId, Number(limit), cursor);
  }

  @Get(':id')
  @Roles('Admin', 'Agent', 'Viewer')
  async getTicket(@Request() req: any, @Param('id') id: string) {
    return this.ticketsService.getTicketById(req.user.tenantId, id);
  }

  @Put(':id')
  @Roles('Admin', 'Agent')
  async updateTicket(
    @Request() req: any,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTicketSchema)) body: any
  ) {
    return this.ticketsService.updateTicket(req.user.tenantId, id, body);
  }

  @Delete(':id')
  @Roles('Admin') // Strict RBAC: Only admins can delete
  async deleteTicket(@Request() req: any, @Param('id') id: string) {
    return this.ticketsService.deleteTicket(req.user.tenantId, id);
  }
}

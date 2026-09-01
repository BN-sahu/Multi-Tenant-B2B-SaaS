import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createCustomerSchema } from '@helpdesk/validation';

@Controller('api/v1/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('Admin', 'Agent')
  async createCustomer(@Body(new ZodValidationPipe(createCustomerSchema)) body: any, @Request() req: any) {
    return this.customersService.createCustomer(req.user.tenantId, body);
  }

  @Get()
  @Roles('Admin', 'Agent', 'Viewer')
  async getCustomers(@Request() req: any, @Query('limit') limit: number = 50, @Query('cursor') cursor?: string) {
    return this.customersService.getCustomers(req.user.tenantId, Number(limit), cursor);
  }

  @Get(':id')
  @Roles('Admin', 'Agent', 'Viewer')
  async getCustomer(@Request() req: any, @Param('id') id: string) {
    return this.customersService.getCustomerById(req.user.tenantId, id);
  }
}

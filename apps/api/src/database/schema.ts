import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
  tenants: TenantTable;
  users: UserTable;
  roles: RoleTable;
  tickets: TicketTable;
  customers: CustomerTable;
}

export type DB = Database;

// -------------------------------------------------------------
// Core Tables
// -------------------------------------------------------------

export interface TenantTable {
  id: Generated<string>;
  name: string;
  domain: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type Tenant = Selectable<TenantTable>;
export type NewTenant = Insertable<TenantTable>;
export type TenantUpdate = Updateable<TenantTable>;

export interface UserTable {
  id: Generated<string>;
  tenant_id: string;
  email: string;
  password_hash: string | null;
  name: string;
  role_id: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;

export interface RoleTable {
  id: Generated<string>;
  tenant_id: string; // Roles are isolated to tenants
  name: string;
  permissions: unknown; // JSONB array of permissions
  is_system_role: boolean;
  created_at: Generated<Date>;
}

// -------------------------------------------------------------
// Domain Tables
// -------------------------------------------------------------

export interface CustomerTable {
  id: Generated<string>;
  tenant_id: string;
  email: string;
  name: string;
  company: string | null;
  notes: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface TicketTable {
  id: Generated<string>;
  tenant_id: string;
  ticket_number: Generated<number>; // Unique per tenant
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  customer_id: string;
  assigned_agent_id: string | null;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  closed_at: Date | null;
}

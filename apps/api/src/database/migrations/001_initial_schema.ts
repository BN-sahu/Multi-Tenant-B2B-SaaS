import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Extensions
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

  // ---------------------------------------------------------
  // 1. Tenants Table (No RLS, global table)
  // ---------------------------------------------------------
  await db.schema
    .createTable('tenants')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('domain', 'varchar(255)')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  // ---------------------------------------------------------
  // 2. Roles Table
  // ---------------------------------------------------------
  await db.schema
    .createTable('roles')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('tenant_id', 'uuid', (col) => col.references('tenants.id').onDelete('cascade').notNull())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('permissions', 'jsonb', (col) => col.defaultTo('[]').notNull())
    .addColumn('is_system_role', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  // RLS for roles
  await sql`ALTER TABLE roles ENABLE ROW LEVEL SECURITY;`.execute(db);
  await sql`ALTER TABLE roles FORCE ROW LEVEL SECURITY;`.execute(db);
  await sql`CREATE POLICY tenant_isolation_policy ON roles USING (tenant_id = current_setting('app.tenant_id', true)::uuid);`.execute(db);

  // ---------------------------------------------------------
  // 3. Users Table
  // ---------------------------------------------------------
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('tenant_id', 'uuid', (col) => col.references('tenants.id').onDelete('cascade').notNull())
    .addColumn('email', 'varchar(255)', (col) => col.notNull())
    .addColumn('password_hash', 'varchar(255)')
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('role_id', 'uuid', (col) => col.references('roles.id').notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('users_tenant_email_unique', ['tenant_id', 'email'])
    .execute();

  // RLS for users
  await sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY;`.execute(db);
  await sql`ALTER TABLE users FORCE ROW LEVEL SECURITY;`.execute(db);
  await sql`CREATE POLICY tenant_isolation_policy ON users USING (tenant_id = current_setting('app.tenant_id', true)::uuid);`.execute(db);

  // ---------------------------------------------------------
  // 4. Customers Table
  // ---------------------------------------------------------
  await db.schema
    .createTable('customers')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('tenant_id', 'uuid', (col) => col.references('tenants.id').onDelete('cascade').notNull())
    .addColumn('email', 'varchar(255)', (col) => col.notNull())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('company', 'varchar(255)')
    .addColumn('notes', 'text')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addUniqueConstraint('customers_tenant_email_unique', ['tenant_id', 'email'])
    .execute();

  // RLS for customers
  await sql`ALTER TABLE customers ENABLE ROW LEVEL SECURITY;`.execute(db);
  await sql`ALTER TABLE customers FORCE ROW LEVEL SECURITY;`.execute(db);
  await sql`CREATE POLICY tenant_isolation_policy ON customers USING (tenant_id = current_setting('app.tenant_id', true)::uuid);`.execute(db);

  // ---------------------------------------------------------
  // 5. Tickets Table
  // ---------------------------------------------------------
  await db.schema
    .createTable('tickets')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
    .addColumn('tenant_id', 'uuid', (col) => col.references('tenants.id').onDelete('cascade').notNull())
    .addColumn('ticket_number', 'serial', (col) => col.notNull())
    .addColumn('subject', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull())
    .addColumn('status', 'varchar(50)', (col) => col.defaultTo('OPEN').notNull())
    .addColumn('priority', 'varchar(50)', (col) => col.defaultTo('NORMAL').notNull())
    .addColumn('customer_id', 'uuid', (col) => col.references('customers.id').notNull())
    .addColumn('assigned_agent_id', 'uuid', (col) => col.references('users.id'))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('closed_at', 'timestamp')
    .execute();

  // RLS for tickets
  await sql`ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;`.execute(db);
  await sql`ALTER TABLE tickets FORCE ROW LEVEL SECURITY;`.execute(db);
  await sql`CREATE POLICY tenant_isolation_policy ON tickets USING (tenant_id = current_setting('app.tenant_id', true)::uuid);`.execute(db);

  // Indexes for performance
  await db.schema.createIndex('idx_tickets_tenant_status').on('tickets').columns(['tenant_id', 'status']).execute();
  await db.schema.createIndex('idx_tickets_tenant_priority').on('tickets').columns(['tenant_id', 'priority']).execute();
  await db.schema.createIndex('idx_tickets_tenant_created_at').on('tickets').columns(['tenant_id', 'created_at']).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('tickets').execute();
  await db.schema.dropTable('customers').execute();
  await db.schema.dropTable('users').execute();
  await db.schema.dropTable('roles').execute();
  await db.schema.dropTable('tenants').execute();
}

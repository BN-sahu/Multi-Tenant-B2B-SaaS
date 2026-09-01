import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private db: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // We fetch the actual role name from the database based on the user's roleId
    // Since this is inside a guard, we must manually fetch the DB instance
    const tenantDb = await this.db.getTenantDb(user.tenantId);
    const roleRecord = await tenantDb
      .selectFrom('roles')
      .select('name')
      .where('id', '=', user.roleId)
      .executeTakeFirst();

    if (!roleRecord) return false;

    return requiredRoles.includes(roleRecord.name);
  }
}

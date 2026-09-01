import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface JwtPayload {
  sub: string; // User ID
  tenantId: string;
  email: string;
  roleId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private databaseService: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-jwt-key',
    });
  }

  async validate(payload: JwtPayload) {
    // Optional: Validate user still exists and hasn't had session revoked
    const db = await this.databaseService.getTenantDb(payload.tenantId);
    
    // We run a simple check to ensure the user actually exists in the db
    const user = await db.selectFrom('users')
      .select(['id', 'tenant_id', 'role_id'])
      .where('id', '=', payload.sub)
      .where('tenant_id', '=', payload.tenantId)
      .executeTakeFirst();
      
    if (!user) {
      throw new UnauthorizedException();
    }
    
    // This return value is injected into the request object as `req.user`
    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      email: payload.email,
      roleId: payload.roleId,
    };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private db: DatabaseService,
  ) {}

  async login(email: string, pass: string) {
    // Note: Logging in requires bypassing tenant isolation since we don't know the tenant yet,
    // or we assume the frontend sends the tenantId. Let's assume standard SaaS where email is globally unique across tenants,
    // or they log into a specific tenant subdomain. Let's assume global email for simplicity.
    const user = await this.db.db.selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user || !user.password_hash) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, tenantId: user.tenant_id, email: user.email, roleId: user.role_id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private db: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    // Only audit mutations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && user) {
      return next.handle().pipe(
        tap(async (response) => {
          // Log audit asynchronously
          const tenantDb = await this.db.getTenantDb(user.tenantId);
          // Assuming an audit_logs table exists
          // await tenantDb.insertInto('audit_logs').values({
          //   tenant_id: user.tenantId,
          //   actor_id: user.userId,
          //   action: `${method} ${url}`,
          //   resource_type: url.split('/')[3] || 'unknown', // naive parsing
          //   metadata: JSON.stringify({ body: request.body }),
          // }).execute();
          
          console.log(`[AUDIT] Tenant: ${user.tenantId} | User: ${user.userId} | Action: ${method} ${url}`);
        }),
      );
    }
    
    return next.handle();
  }
}

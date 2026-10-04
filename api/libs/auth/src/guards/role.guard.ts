import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@new-poster-parlor-api/models';
import { RequestWithUser } from '@new-poster-parlor-api/shared';
import { ForbiddenException } from '@new-poster-parlor-api/utils';
import { Observable } from 'rxjs';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const requiredRole = this.reflector.getAllAndOverride<UserRole[]>(
        'roles',
        [context.getHandler(), context.getClass()]
      );

      if (!requiredRole || requiredRole.length === 0) {
        return true;
      }
      if (!Array.isArray(requiredRole)) {
        throw new ForbiddenException('Your are not authorized to access this resource');
      }
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      if (!user) {
        throw new ForbiddenException('User is not authenticated');
      }

      const hasRole = requiredRole.some((role) => role === user.role);

      if (!hasRole) {
        throw new ForbiddenException(
          `Access denied . Required role(s): ${requiredRole.join(' or ')}`
        );
      }
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Role validation Failed');
    }
  }
}

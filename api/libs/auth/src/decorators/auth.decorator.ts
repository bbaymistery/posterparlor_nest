import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UnauthorizedException, UseGuards, } from '@nestjs/common';
import { UserRole } from '@new-poster-parlor-api/models';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { AuthenticatedUser, RequestWithUser } from '@new-poster-parlor-api/shared';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLE_KEY = 'roles';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Roles = (...roles: UserRole[]) => {
  if (!roles || roles.length === 0) {
    throw new Error('Roles decorator required atleast one role');
  }

  return SetMetadata(ROLE_KEY, roles);
};

export const Auth = (...roles: UserRole[]) => {
  if (roles.length > 0) {
    const invalidRoles = roles.filter((role) => typeof role !== 'string' || !role);

    if (invalidRoles.length > 0) {
      throw new Error(`Invalid role provided: ${invalidRoles.join(', ')}`);
    }
  }

  if (roles.length === 0) {
    return applyDecorators(UseGuards(JwtAuthGuard));
  }

  return applyDecorators(UseGuards(JwtAuthGuard, RoleGuard), Roles(...roles));
};

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext
  ): AuthenticatedUser | string | undefined => {
    try {
      const request = ctx.switchToHttp().getRequest<RequestWithUser>();

      const user = request.user;

      if (!user) {
        throw new UnauthorizedException(
          'Login Required to access this resource'
        );
      }

      if (typeof user !== 'object' || !user.id || !user.email || !user.role) {
        throw new UnauthorizedException('Invalid user object in request');
      }

      if (data) {
        const value = user[data];

        if (value === undefined || value === null) {
          throw new UnauthorizedException(`User property '${data}' not found`);
        }
        return value;
      }
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to extract user from request');
    }
  }
);

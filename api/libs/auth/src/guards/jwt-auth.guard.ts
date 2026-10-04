import { Injectable, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { CustomHttpException, UnauthorizedException, } from '@new-poster-parlor-api/utils';
import { Observable } from 'rxjs';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isPublic === true) {
        return true;
      }
      return super.canActivate(context);
    } catch (error) {
      throw new CustomHttpException(
        'Authentication Failed',
        500,
        'AUTH_FAILED',
        error
      );
    }
  }

  override handleRequest<TUser extends Record<string, unknown> = Record<string, unknown>>(err: Error | null, user: TUser | false, info: Error | undefined): TUser {
    if (err) {
      throw err;
    }

    if (!user) {
      if (info) {
        if (info.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        }
        if (info.name === 'JsonWebTokenError') {
          throw new CustomHttpException(
            'Invalid token',
            HttpStatus.UNAUTHORIZED,
            'JSON_WEB_TOKEN_ERROR'
          );
        }
        if (info.name === 'NotBeforeError') {
          throw new UnauthorizedException('Token is not yet valid');
        }
      }
      throw new UnauthorizedException('Login Required to access this resource');
    }

    return user;
  }
}

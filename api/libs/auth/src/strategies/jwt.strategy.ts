import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { User, UserDocument } from '@new-poster-parlor-api/models';
import { AppConfigService } from '@new-poster-parlor-api/config';
import { JwtTokenPayload } from '@new-poster-parlor-api/shared';
import { ConflictException, CustomHttpException, ForbiddenException, NotFoundException, UnauthorizedException, } from '@new-poster-parlor-api/utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    config: AppConfigService
  ) {
    const secret = config.authConfig.jwtAccessTokenSecret;

    // ✅ Validate secret exists
    if (!secret) {
      throw new Error('JWT_ACCESS_TOKEN_SECRET is not configured');
    }

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtStrategy.extractJWTFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: false,
    };

    super(options);
  }

  private static extractJWTFromCookie(req: Request): string | null {
    try {
      // Check if cookies exist and have the access_token
      if (
        req.cookies &&
        typeof req.cookies === 'object' &&
        'access_token' in req.cookies &&
        typeof req.cookies.access_token === 'string' &&
        req.cookies.access_token.trim().length > 0
      ) {
        return req.cookies.access_token;
      }
      return null;
    } catch {
      return null;
    }
  }

  async validate(payload: unknown) {
    try {
      // Type guard for payload
      if (!this.isValidJwtPayload(payload)) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Validate payload fields
      if (!payload.sub || typeof payload.sub !== 'string') {
        throw new UnauthorizedException('Invalid token: missing user ID');
      }
      if (!payload.email || typeof payload.email !== 'string') {
        throw new UnauthorizedException('Invalid token: missing email'); // ✅ Fixed typo
      }
      if (!payload.role || typeof payload.role !== 'string') {
        throw new UnauthorizedException('Invalid token: missing role'); // ✅ Fixed typo
      }

      // Validate ObjectId format
      if (!Types.ObjectId.isValid(payload.sub)) {
        throw new UnauthorizedException('Invalid token: malformed user ID');
      }

      // Fetch user from database
      const user = await this.userModel
        .findById(payload.sub)
        .select('_id email role name isActive')
        .lean()
        .exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new ForbiddenException('User account is temporarily deactivated');
      }

      // Verify email hasn't changed
      if (user.email !== payload.email) {
        throw new ConflictException(
          'Token invalid: user information has changed'
        );
      }

      // Return sanitized user object
      return {
        id: (user._id as Types.ObjectId).toString(),
        email: user.email,
        role: user.role,
        name: user.name || 'User',
      };
    } catch (error) {
      // Re-throw known exceptions
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      // Handle unexpected errors
      throw new CustomHttpException('Token validation failed');
    }
  }

  private isValidJwtPayload(payload: unknown): payload is JwtTokenPayload {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'sub' in payload &&
      'email' in payload &&
      'role' in payload
    );
  }
}

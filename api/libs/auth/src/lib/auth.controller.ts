import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from '@new-poster-parlor-api/models';
import type { Response, Request } from 'express';
import { UnauthorizedException } from '@new-poster-parlor-api/utils';
import type { AuthenticatedUser } from '@new-poster-parlor-api/shared';

import { Auth, CurrentUser, Public } from '../decorators/auth.decorator'; // Made changes in me  route as well

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: AuthService) { }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.googleAuthService.loginWithGoogle(
      dto.idToken,
      res
    );
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response // ✅ Add Response object
  ) {
    const token = req.cookies?.['refresh_token'];

    if (!token) {
      throw new UnauthorizedException('No refresh token is provided');
    }

    const result = await this.googleAuthService.refreshAccessToken(token, res); // ✅ Pass res

    return result;
  }

  @Auth()
  @Get('me') // Made chnages from @Res to used Current user decorator
  async getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    const result = user;
    return result;
  }

  @Auth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    const result = await this.googleAuthService.logout(res);
    return result;
  }
}

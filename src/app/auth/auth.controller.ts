import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dtos';
import type { Request, Response } from 'express';
import { Public } from 'src/lib/decorators';
import { Helper } from 'src/lib/helpers';
import { JwtRefreshGuard } from 'src/lib/guards';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly helper: Helper,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() data: CreateUserDto) {
    const user = await this.authService.create(data);

    return {
      status: true,
      message: 'user created successfully',
      data: user,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() { email, password }: LoginDto,
  ) {
    const { user, accessToken, refreshToken, message } =
      await this.authService.login(email, password);

    if (user.isEmailVerified === false) {
      return {
        status: true,
        message,
        data: user,
      };
    }

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: +process.env['ACCESS_TOKEN_COOKIE_EXPIRES_IN']! * 60 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        +process.env['REFRESH_TOKEN_COOKIE_EXPIRES_IN']! * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      status: true,
      message: 'user logged in successfully',
      data: user,
    };
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Res({ passthrough: true }) res: Response,
    @Body() data: { email: string; otp: string },
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.verifyOtp(data.email, data.otp);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: +process.env['ACCESS_TOKEN_COOKIE_EXPIRES_IN']! * 60 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        +process.env['REFRESH_TOKEN_COOKIE_EXPIRES_IN']! * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      status: true,
      message: 'otp verified successfully',
      data: user,
    };
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resentOtp(@Body() { email }: { email: string }) {
    return await this.authService.resendOtp(email);
  }

  @Public()
  @Post('refresh-tokens')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refreshToken(
      req.payload.refreshToken,
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: +process.env['ACCESS_TOKEN_COOKIE_EXPIRES_IN']! * 60 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        +process.env['REFRESH_TOKEN_COOKIE_EXPIRES_IN']! * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      status: true,
      message: 'tokens generated successfully',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = req.payload;
    await this.authService.logout(refreshToken, accessToken).then(() => {
      res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge:
          +process.env['ACCESS_TOKEN_COOKIE_EXPIRES_IN']! * 60 * 60 * 1000,
        path: '/',
      });

      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge:
          +process.env['RERESH_TOKEN_COOKIE_EXPIRES_IN']! * 24 * 60 * 60 * 1000,
        path: '/',
      });
    });

    return {
      status: true,
      message: 'logout successful',
    };
  }
}

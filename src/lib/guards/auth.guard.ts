import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Helper } from '../helpers';
import { PrismaService } from 'src/shared/database';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly helper: Helper,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const token = request.cookies.access_token;
    if (!token) throw new UnauthorizedException('You are not logged in');

    try {
      const payload = await this.helper.verifyAccessToken(token);

      const blocked = await this.helper.isBlocked(payload.jti);
      if (blocked) {
        throw new UnauthorizedException('Access token has been revoked');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (
        user.passwordChangedAt &&
        new Date(payload.exp * 1000) < new Date(user.passwordChangedAt)
      )
        throw new ForbiddenException('password changed, Login again');

      request.user = this.sanitizeObject(user);
      request.payload = request.payload || {} as any;
      request.payload.accessToken = token;
    } catch (err) {
      this.logger.error('Invalid token', err);
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  private sanitizeObject(user: Record<string, any>) {
    const { refreshToken, password, otp, otpExpiresAt, ...result } = user;
    return result;
  }
}

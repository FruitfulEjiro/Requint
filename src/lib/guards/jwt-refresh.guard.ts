import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Helper } from '../helpers';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  private readonly logger = new Logger();
  constructor(private readonly helper: Helper) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies.refresh_token;
    if (!token) throw new UnauthorizedException('invalid token');

    try {
      const payload = await this.helper.verifyRefreshToken(token);
      if (!payload) throw new UnauthorizedException('you are not logged in!');

      request.payload = request.payload || ({} as any);
      request.payload.refreshToken = token;
      return true;
    } catch (err) {
      this.logger.error('invalid refresh tokenn', err);
      throw new UnauthorizedException('Invalid refresh tokenn');
    }
  }
}

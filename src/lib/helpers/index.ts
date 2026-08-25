import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { randomInt, randomUUID } from 'crypto';
import Redis from 'ioredis';
import { ROTATE_REFRESH_SCRIPT } from '../scripts';

@Injectable()
export class Helper {
  private readonly logger = new Logger(Helper.name);

  get refreshTTL() {
    const val = process.env['REFRESH_TOKEN_COOKIE_EXPIRES_IN'];
    return val ? Number(val) * 24 * 60 * 60 : 7 * 24 * 60 * 60;
  }

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    private readonly jwt: JwtService,
  ) {}

  async hash(data: string) {
    try {
      return await bcrypt.hash(data, 12);
    } catch (err) {
      this.logger.error('has not successful', err);
      throw new InternalServerErrorException("couldn't hash password");
    }
  }

  async verify(data: string, DBData: string) {
    try {
      return await bcrypt.compare(data, DBData);
    } catch (err) {
      this.logger.error("couldn't verify", err);
      throw new InternalServerErrorException("couldn't verify");
    }
  }

  generateOTP() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let otp = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = randomInt(0, chars.length);
      otp += chars[randomIndex];
    }

    return otp;
  }

  sanitizeObject(user: Record<string, any>) {
    const { refreshToken, password, otp, otpExpiresAt, ...result } = user;
    return result;
  }

  async generateTokens(data: { email: string; id: string; familyId?: string }) {
    const isNewFamily = !data.familyId;
    const resolvedFamilyId = data.familyId ?? randomUUID();
    const jti = randomUUID();
    const accessTokenJti = randomUUID();

    const accessPayload = {
      email: data.email,
      id: data.id,
      jti: accessTokenJti,
    };
    const refreshPayload = {
      email: data.email,
      id: data.id,
      jti,
      familyId: resolvedFamilyId,
    };
    const record = {
      userId: data.id,
      familyId: resolvedFamilyId,
      used: false,
      createdAt: Date.now(),
    };

    const accessToken = await this.jwt.sign(accessPayload, {
      secret: process.env['ACCESS_TOKEN_SECRET'],
      expiresIn: '1h',
    });

    // create redis record
    const pipeline = this.redis.pipeline();
    pipeline.set(
      `refresh:${jti}`,
      JSON.stringify(record),
      'EX',
      this.refreshTTL,
    );
    pipeline.sadd(`family:${resolvedFamilyId}`, jti);
    pipeline.expire(`family:${resolvedFamilyId}`, this.refreshTTL);
    await pipeline.exec();

    if (isNewFamily) {
      await this.redis.sadd(`user-families:${data.id}`, resolvedFamilyId);
    }

    const refreshToken = await this.jwt.sign(refreshPayload, {
      secret: process.env['REFRESH_TOKEN_SECRET'],
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      resolvedFamilyId,
      isNewFamily,
    };
  }

  async verifyAccessToken(token: string) {
    try {
      return this.jwt.verify(token, {
        secret: process.env['ACCESS_TOKEN_SECRET'],
      });
    } catch {
      throw new InternalServerErrorException('couldnt verify access token');
    }
  }

  async verifyRefreshToken(token: string) {
    try {
      return this.jwt.verify(token, {
        secret: process.env['REFRESH_TOKEN_SECRET'],
      });
    } catch (err) {
      throw new InternalServerErrorException('couldnt verify refresh token');
    }
  }

  async revokeFamily(familyId: string): Promise<void> {
    const jtis = await this.redis.smembers(`family:${familyId}`);
    if (jtis.length === 0) return;

    const pipeline = this.redis.pipeline();
    jtis.forEach((jti) => pipeline.del(`refresh:${jti}`));
    pipeline.del(`family:${familyId}`);
    await pipeline.exec();
  }

  async block(jti: string, expiresAt: number): Promise<void> {
    const ttl = expiresAt - Math.floor(Date.now() / 1000);
    if (ttl <= 0) return;

    await this.redis.set(`denylist:${jti}`, '1', 'EX', ttl);
  }

  async isBlocked(jti: string): Promise<boolean> {
    const result = await this.redis.exists(`denylist:${jti}`);
    return result === 1;
  }

  generatePassword() {
    const length = 16;
    const charset =
      'abcdefghijklmnopqrstuvwxyz-' +
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ-' +
      '0123456789-';

    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[randomValues[i] % charset.length];
    }
    return password;
  }
}

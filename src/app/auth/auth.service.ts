import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepo } from 'src/shared/database/repositories';
import { CreateUserDto } from './dtos';
import { Helper } from 'src/lib/helpers';
import { randomUUID } from 'node:crypto';
import { ROTATE_REFRESH_SCRIPT } from 'src/lib/scripts';
import Redis from 'ioredis';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private rotateScriptSha: string;

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    private readonly user: UserRepo,
    private readonly helper: Helper,
  ) {}

  async onModuleInit() {
    this.rotateScriptSha = (await this.redis.script(
      'LOAD',
      ROTATE_REFRESH_SCRIPT,
    )) as string;
  }

  async create(data: CreateUserDto) {
    const existingUser = await this.user.findByEmail(data.email);
    if (existingUser) throw new BadRequestException('user already exists');

    const hashedPassword = await this.helper.hash(data.password);
    const user = await this.user.create({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: hashedPassword,
    });

    const otp = this.helper.generateOTP();
    const hashedOtp = await this.helper.hash(otp);

    await this.user
      .update(user.id, {
        otp: hashedOtp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      })
      .then(() => this.logger.log('otp sent to user'))
      .catch((err) => {
        this.logger.error(err);
        throw new InternalServerErrorException("couldn't save otp to the DB");
      });

    // send email otp to user

    return this.helper.sanitizeObject(user);
  }

  async login(email: string, password: string) {
    const checkUser = await this.user.findByEmail(email);
    if (
      !checkUser ||
      !(await this.helper.verify(password, checkUser.password!))
    )
      throw new UnauthorizedException('email or password incorrect');

    if (checkUser.isEmailVerified === false) {
      const otp = this.helper.generateOTP();
      const hashedOtp = await this.helper.hash(otp);

      await this.user
        .update(checkUser.id, {
          otp: hashedOtp,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        })
        .then(() => this.logger.log('otp sent to user'))
        .catch((err) => {
          this.logger.error(err);
          throw new InternalServerErrorException("couldn't save otp to the DB");
        });

      // send email otp to user

      return {
        message: 'otp sent to user',
        user: this.helper.sanitizeObject(checkUser),
      };
    }

    const { accessToken, refreshToken } = await this.helper.generateTokens({
      email,
      id: checkUser.id,
    });

    const hashedRefreshToken = await this.helper.hash(refreshToken);

    await this.user
      .update(checkUser.id, { refreshToken: hashedRefreshToken })
      .then(() => this.logger.log('refresh token saved to DB'))
      .catch((err) => {
        this.logger.error(err);
        throw new InternalServerErrorException(
          'failed to update refresh token! login again',
        );
      });

    return {
      accessToken,
      refreshToken,
      user: this.helper.sanitizeObject(checkUser),
    };
  }

  async verifyOtp(email: string, otp: string) {
    const checkUser = await this.user.findByEmail(email);
    if (
      !checkUser ||
      !(await this.helper.verify(otp, checkUser.otp!)) ||
      new Date(checkUser.otp!) < new Date()
    )
      throw new BadRequestException('otp is invalid or expired');

    await this.user.update(checkUser.id, {
      otp: null,
      otpExpiresAt: null,
    });

    const { accessToken, refreshToken } = await this.helper.generateTokens({
      email,
      id: checkUser.id,
    });

    const hashedRefreshToken = await this.helper.hash(refreshToken);

    const user = await this.user
      .update(checkUser.id, {
        refreshToken: hashedRefreshToken,
        isEmailVerified: true,
      })
      .then((data) => {
        this.logger.log('refresh token saved to DB');
        return data;
      })
      .catch((err) => {
        this.logger.error(err);
        throw new InternalServerErrorException(
          'failed to update refresh token! login again',
        );
      });

    return {
      accessToken,
      refreshToken,
      user: this.helper.sanitizeObject(user!),
    };
  }

  async resendOtp(email: string) {
    const checkUser = await this.user.findByEmail(email);
    if (!checkUser) throw new BadRequestException('user not found');

    const otp = this.helper.generateOTP();
    const hashedOtp = await this.helper.hash(otp);

    await this.user
      .update(checkUser.id, {
        otp: hashedOtp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      })
      .then(() => this.logger.log('otp sent to user'))
      .catch((err) => {
        this.logger.error(err);
        throw new InternalServerErrorException("couldn't save otp to the DB");
      });

    // send email otp to user

    return {
      message: 'otp sent to user',
      user: this.helper.sanitizeObject(checkUser),
    };
  }

  async refreshToken(token: string) {
    if (!token) throw new UnauthorizedException('you are not logged in');

    const verifyToken = await this.helper.verifyRefreshToken(token);
    console.log(verifyToken)

    const result = (await this.redis.evalsha(
      this.rotateScriptSha,
      1,
      `refresh:${verifyToken.jti}`,
    )) as string | null;

    if (result === null) {
      throw new UnauthorizedException('+++invalid token! login again');
    }

    if (result === 'REUSED') {
      const raw = await this.redis.get(`refresh:${verifyToken.jti}`);
      if (!raw) throw new UnauthorizedException('...invalid token! login again');
      const record = JSON.parse(raw);
      await this.helper.revokeFamily(record.familyId);
      throw new UnauthorizedException('invalid token! login again');
    }

    const user = await this.user.findById(verifyToken.id);
    if (!user) throw new UnauthorizedException('===invalid token! login again');
    try {
      await this.helper.verify(token, user.refreshToken!);
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException(',,,invalid token! login again');
    }

    const { accessToken, refreshToken } = await this.helper.generateTokens({
      email: user!.email,
      id: user!.id,
      familyId: verifyToken.familyId,
    });

    const hashedRefreshToken = await this.helper.hash(refreshToken);

    await this.user
      .update(user!.id, { refreshToken: hashedRefreshToken })
      .then(() => this.logger.log('refresh token saved to DB'))
      .catch((err) => {
        this.logger.error(err);
        throw new InternalServerErrorException(
          'failed to update refresh token! login again',
        );
      });

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string, accessToken: string): Promise<void> {
    try {
      const refreshPayload = await this.helper.verifyRefreshToken(refreshToken);
      const accessPayload = await this.helper.verifyAccessToken(accessToken);
      const raw = await this.redis.get(`refresh:${refreshPayload.jti}`);

      if (raw) {
        const record = JSON.parse(raw);
        await this.helper.revokeFamily(record.familyId);
      }

      await this.helper.block(accessPayload.jti, accessPayload.exp);
    } catch (err) {
      this.logger.error(err);
      throw new ForbiddenException('you are already logged out');
    }
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/database';

@Injectable()
export class AdminGuard implements CanActivate {
  private logger = new Logger(AdminGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user
    if(!user) throw new UnauthorizedException('You are not logged in!');

    const membership = await this.prisma.membership.findFirst({
      where: { userId: user.id },
    });
    if (!membership)
      throw new NotFoundException('You are not part of this team!');

    if (membership.role === 'SuperAdmin') return true;

    if (membership.role !== 'Admin')
      throw new ForbiddenException('You are not admin!');

    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/shared/database';
import { PERMISSIONS_KEY } from '../constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('You are not logged in!');
    }

    const membership = await this.prisma.membership.findFirst({
      where: { userId: user.id },
    });
    if (!membership) {
      throw new NotFoundException('You are not part of this team!');
    }

    // SuperAdmin automatically bypasses permission checks
    if (membership.role === 'SuperAdmin') {
      return true;
    }

    // Fetch the user's permissions
    const userPermissions = await this.prisma.rolePermissions.findMany({
      where: { userId: user.id },
      include: {
        permissions: true,
      },
    });

    const hasPermission = requiredPermissions.every((requiredPermission) =>
      userPermissions.some((up) => up.permissions.name === requiredPermission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have the required permissions!');
    }

    return true;
  }
}

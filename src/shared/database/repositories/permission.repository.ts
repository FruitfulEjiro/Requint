import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Permissions, Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class permissionRepo extends BaseRepository<
  Permissions,
  Prisma.PermissionsCreateInput,
  Prisma.PermissionsWhereInput,
  Prisma.PermissionsUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.permissions);
  }
}

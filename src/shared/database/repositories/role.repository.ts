import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Prisma, Role } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { RolePermissionsCreateInput } from 'generated/prisma/models';

@Injectable()
export class RoleRepo extends BaseRepository<
  Role,
  Prisma.RoleCreateInput,
  Prisma.RoleWhereInput,
  Prisma.RoleUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.role);
  }

  async checkPermission(id: string) {
    return this.prisma.permissions.findUniqueOrThrow({ where: { id } });
  }

  async createRolePermission(data: RolePermissionsCreateInput) {
    return this.prisma.rolePermissions.create({ data });
  }

  async findRolePermnission(data: {
    roleId: string;
    permissionId: string;
    userId: string;
  }) {
    return await this.prisma.rolePermissions.findUnique({
      where: {
        roleId_permissionId_userId: data,
      },
    });
  }

  async deleteRolePermission(id: string) {
    return await this.prisma.rolePermissions.delete({ where: { id } });
  }

  async findMembership(membershipId: string) {
    return await this.prisma.membership.findFirst({
      where: { id: membershipId },
    });
  }

  async updateMembership(id: string, data: Prisma.MembershipUpdateInput) {
    return this.prisma.membership.update({ where: { id }, data });
  }
}

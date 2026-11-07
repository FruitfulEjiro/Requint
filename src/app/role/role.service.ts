import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RoleRepo } from 'src/shared/database/repositories';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(private readonly roleRepo: RoleRepo) {}

  async getAllRoles() {
    try {
      const roles = await this.roleRepo.findAll();

      return roles;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async assignRole(membershipId: string, roleId: string,) {
    try {
      const role = await this.roleRepo.findById(roleId);
      if (!role) throw new NotFoundException('role not found');

      const roleUpdate = await this.roleRepo.updateMembership(membershipId, {
        role: role.name,
      });

      return roleUpdate;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async assignPermission(
    permissionIds: string[],
    roleId: string,
    userId: string,
  ) {
    try {
      const checkPermissions = permissionIds.map(async (id) => {
        await this.roleRepo.checkPermission(id);
      });

      const rolePermissions = permissionIds.forEach((id) => {
        this.roleRepo.createRolePermission({
          role: {
            connect: {
              id: roleId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
          permissions: {
            connect: {
              id,
            },
          },
        });
      });

      return rolePermissions;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async removePermission(userId: string, roleId: string, permissionId: string) {
    try {
      const rolePermission = await this.roleRepo.findRolePermnission({
        roleId,
        permissionId,
        userId,
      });
      if (!rolePermission)
        throw new NotFoundException('user doesnt have this permission');

      await this.roleRepo.deleteRolePermission(rolePermission!.id);

      return {};
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }
}

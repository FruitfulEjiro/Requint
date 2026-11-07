import { Injectable, Logger } from '@nestjs/common';
import { permissionRepo } from 'src/shared/database/repositories';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(private readonly permissionRepo: permissionRepo) {}

  async getAllPermission() {
    const permissions = await this.permissionRepo.findAll();

    return permissions;
  }
}

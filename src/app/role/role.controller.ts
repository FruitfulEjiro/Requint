import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { MemberExistPipe } from 'src/lib/pipes';
import { AdminGuard } from 'src/lib/guards';
import { RequirePermissions } from 'src/lib/decorators';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('all')
  @RequirePermissions('role:read:all')
  @HttpCode(HttpStatus.OK)
  async getAllRoles() {
    const roles = await this.roleService.getAllRoles();

    return {
      status: true,
      message: 'roles retrieved successfully',
      data: roles,
    };
  }

  @Post('/:roleId/assign-role/:membershipId')
  @RequirePermissions('role:assign:permission')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async assignPermission(
    @Param('membershipId', MemberExistPipe) membershipId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.roleService.assignRole(membershipId, roleId);
  }
}

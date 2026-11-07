import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { CreateMemberDTO } from './dtos';
import { CurrentUser, RequirePermissions } from 'src/lib/decorators';
import type { User } from 'generated/prisma/client';
import { AdminGuard } from 'src/lib/guards';

@Controller('members')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post('create/:teamId')
  @UseGuards(AdminGuard)
  @RequirePermissions('member:create')
  @HttpCode(HttpStatus.CREATED)
  async createMember(
    @CurrentUser() user: User,
    @Param('teamId') teamId: string,
    @Body() data: CreateMemberDTO,
  ) {
    const member = await this.membershipService.createMember(
      user.id,
      teamId,
      data,
    );

    return {
      status: true,
      message: 'member created successfully',
      data: member,
    };
  }

  @Post('remove/:membershipId/:teamId')
  @UseGuards(AdminGuard)
  @RequirePermissions('member:remove')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('membershipId') membershipId: string,
    @Param('teamId') teamId: string,
  ) {
    const member = await this.membershipService.removeMember(
      membershipId,
      teamId,
    );

    return {
      status: true,
      message: 'member removed successfully',
      data: member,
    };
  }
}

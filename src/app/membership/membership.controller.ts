import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { CreateMemberDTO } from './dtos';
import { CurrentUser } from 'src/lib/decorators';
import type { User } from 'generated/prisma/client';

@Controller('member')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post('create/:teamId')
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

  @Delete('delete/:membershipId/:teamId')
  // team lead or admin guard
  @HttpCode(HttpStatus.OK)
  async removeMember(
    // @CurrentUser() user: User,
    @Param('membershipId') membershipId: string,
    @Param('teamId') teamId: string,
  ) {
    const member = await this.membershipService.removeMember(membershipId, teamId);

    return {
      status: true,
      message: 'member removed successfully',
      data: member,
    };
  }
}

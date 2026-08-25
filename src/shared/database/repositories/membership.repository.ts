import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from 'src/app/auth/dtos';
import type { Membership } from 'generated/prisma/client';
import { CreateEmployeeDTO } from 'src/app/employee/dtos';

@Injectable()
export class MemberRepo extends BaseRepository<
  Membership,
  Prisma.MembershipCreateInput,
  Prisma.MembershipWhereInput,
  Prisma.MembershipUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.membership);
  }

  async findPopulatedMember(memberId: string, teamId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { id: memberId },
      include: {
        user: true,
        team: true,
      },
    });
    return membership;
  }

  async createUser(data: CreateUserDto) {
    const user = await this.prisma.user.create({ data });
    if (!user) throw new InternalServerErrorException('couldnt create user');

    return user;
  }

  async checkTeam(teamId: string) {
    return await this.prisma.team.findUnique({ where: { id: teamId } });
  }
}

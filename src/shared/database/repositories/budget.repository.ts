import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Budget, Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BudgetRepo extends BaseRepository<
  Budget,
  Prisma.BudgetCreateInput,
  Prisma.BudgetWhereInput,
  Prisma.BudgetUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.budget);
  }

  async checkTeam(teamId: string) {
    return await this.prisma.team.findUnique({ where: { id: teamId } });
  }
}

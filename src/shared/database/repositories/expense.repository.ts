import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Expense, Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ExpenseRepo extends BaseRepository<
  Expense,
  Prisma.ExpenseCreateInput,
  Prisma.ExpenseWhereInput,
  Prisma.ExpenseUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.expense);
  }

  async checkTeam(teamId: string) {
    return await this.prisma.team.findUnique({ where: { id: teamId } });
  }
}

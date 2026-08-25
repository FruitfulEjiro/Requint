import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Employee, Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EmployeeRepo extends BaseRepository<
  Employee,
  Prisma.EmployeeCreateInput,
  Prisma.EmployeeWhereInput,
  Prisma.EmployeeUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.employee);
  }

  async checkTeam(teamId: string) {
    return await this.prisma.team.findUnique({ where: { id: teamId } });
  }
}

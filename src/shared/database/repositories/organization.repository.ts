import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Organization, Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrgRepo extends BaseRepository<
  Organization,
  Prisma.OrganizationCreateInput,
  Prisma.OrganizationWhereInput,
  Prisma.OrganizationUpdateInput
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.organization);
  }
}

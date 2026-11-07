import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { PrismaService } from 'src/shared/database';

@Injectable()
export class MemberExistPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: string) {
    const member = await this.prisma.membership.findUnique({
      where: { id: value },
    });
    if (!member) throw new NotFoundException('member not found');

    const user = await this.prisma.user.findUnique({
      where: { id: member.userId },
    });
    if (!user) throw new NotFoundException('user not found');
    
    return member.id;
  }
}

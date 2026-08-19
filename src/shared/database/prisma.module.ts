import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserRepo } from './repositories';
import { Helper } from 'src/lib/helpers';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [JwtModule],
  providers: [PrismaService, UserRepo, Helper],
  exports: [PrismaService, UserRepo, Helper],
})
export class PrismaModule {}

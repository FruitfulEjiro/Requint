import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleRepo } from 'src/shared/database/repositories';
import { RoleController } from './role.controller';

@Module({
  imports: [],
  exports: [RoleService],
  providers: [RoleService, RoleRepo],
  controllers: [RoleController],
})
export class RoleModule {}

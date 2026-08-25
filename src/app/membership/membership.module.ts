import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MemberRepo } from 'src/shared/database/repositories';
import { EmployeeModule } from '../employee';
import { EmailModule } from 'src/shared/email';
import { MembershipController } from './membership.controller';

@Module({
  imports: [EmployeeModule, EmailModule],
  exports: [MembershipService],
  providers: [MembershipService, MemberRepo],
  controllers: [MembershipController],
})
export class MembershipModule {}

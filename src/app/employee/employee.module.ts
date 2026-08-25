import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeRepo } from 'src/shared/database/repositories';
import { EmployeeController } from './employee.controller';

@Module({
  imports: [],
  exports: [EmployeeService, EmployeeRepo],
  providers: [EmployeeService, EmployeeRepo],
  controllers: [EmployeeController],
})
export class EmployeeModule {}

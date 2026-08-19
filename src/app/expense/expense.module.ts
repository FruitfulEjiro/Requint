import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseRepo } from 'src/shared/database/repositories';
import { ExpenseController } from './expense.controller';

@Module({
  imports: [],
  exports: [ExpenseService],
  providers: [ExpenseService, ExpenseRepo],
  controllers: [ExpenseController],
})
export class ExpenseModule {}

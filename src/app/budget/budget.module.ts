import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetRepo } from 'src/shared/database/repositories';
import { BudgetController } from './budget.controller';

@Module({
  imports: [],
  exports: [BudgetService],
  providers: [BudgetService, BudgetRepo],
  controllers: [BudgetController],
})
export class BudgetModule {}

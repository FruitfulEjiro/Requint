// update-budget.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateBudgetDTO } from './create-budget.dto';

export class UpdateBudgetDTO extends PartialType(
  OmitType(CreateBudgetDTO, ['teamId', 'createdById'] as const),
) {}

import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateExpenseDTO } from './create-expense.dto';

export class UpdateExpenseDTO extends PartialType(
  OmitType(CreateExpenseDTO, ['teamId', 'submittedById'] as const),
) {}

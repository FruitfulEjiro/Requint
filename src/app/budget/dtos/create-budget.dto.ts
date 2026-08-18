import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { BudgetStatus } from 'generated/prisma/enums';

export class CreateBudgetDTO {
  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  totalAmount: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  allocatedAmount: number;

  @IsString()
  @IsOptional()
  period?: string;

  @IsString()
  @IsOptional()
  createdById?: string;
}

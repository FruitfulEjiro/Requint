import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateEmployeeDTO } from './create-employee.dto';

export class UpdateEmployeeDTO extends PartialType(
  OmitType(CreateEmployeeDTO, ['teamId', 'userId'] as const),
) {}

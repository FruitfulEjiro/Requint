import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { EmploymentStatus } from "generated/prisma/enums";

export class CreateEmployeeDTO {
  @IsString()
  @IsOptional()
  teamId?: string;
  
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  jobTitle: string

  @IsString()
  @IsOptional()
  startDate: Date

  @IsString()
  @IsOptional()
  endDate: Date
}

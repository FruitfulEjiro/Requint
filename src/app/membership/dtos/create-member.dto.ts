import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMemberDTO {
  @IsString()
  @IsNotEmpty()
  firstname!: string;

  @IsString()
  @IsNotEmpty()
  lastname!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;
}

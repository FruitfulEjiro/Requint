import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class ImageDto {
  @IsUrl()
  @IsNotEmpty()
  secure_url!: string;

  @IsString()
  @IsOptional()
  public_id?: string;
}

export class CreateExpenseDTO {
  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  submittedById?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageDto)
  receipt?: ImageDto;
}

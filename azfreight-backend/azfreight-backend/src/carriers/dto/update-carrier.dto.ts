import { IsArray, IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateCarrierDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  transportTypes?: string[];

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

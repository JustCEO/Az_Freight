import { IsArray, IsOptional, IsString, IsEmail, IsBoolean, IsNumber, IsDateString, IsEnum } from 'class-validator';

export class UpdateCarrierDto {
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) transportTypes?: string[];
  @IsOptional() @IsString() taxId?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() notes?: string;

  @IsOptional() @IsEnum(['CONTAINERS', 'BREAKBULK', 'BOTH'])
  seaFreightType?: string;

  @IsOptional() @IsBoolean() hasWarehouse?: boolean;
  @IsOptional() @IsBoolean() customClearance?: boolean;
  @IsOptional() @IsString() taxResidenceDTA?: string;
  @IsOptional() @IsString() complianceCert?: string;
  @IsOptional() @IsString() contractNumber?: string;
  @IsOptional() @IsDateString() contractStart?: string;
  @IsOptional() @IsDateString() contractEnd?: string;
  @IsOptional() @IsString() contractDetails?: string;
  @IsOptional() @IsString() contactPerson?: string;
  @IsOptional() @IsEmail() contactEmail?: string;
  @IsOptional() @IsNumber() creditTermDays?: number;
}

import { IsString, IsOptional, IsDateString, IsArray, IsEnum } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  licenseNumber?: string;

  @IsOptional() @IsDateString()
  licenseExpiry?: string;

  @IsOptional() @IsArray()
  licenseCategories?: string[];

  @IsOptional() @IsDateString()
  medicalExpiry?: string;

  @IsOptional() @IsString()
  passportNumber?: string;

  @IsOptional() @IsDateString()
  passportExpiry?: string;
}

export class UpdateDriverDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  licenseNumber?: string;

  @IsOptional() @IsDateString()
  licenseExpiry?: string;

  @IsOptional() @IsArray()
  licenseCategories?: string[];

  @IsOptional() @IsDateString()
  medicalExpiry?: string;

  @IsOptional() @IsString()
  passportNumber?: string;

  @IsOptional() @IsDateString()
  passportExpiry?: string;

  @IsOptional() @IsEnum(['available', 'on_route', 'on_leave', 'inactive'])
  status?: string;
}

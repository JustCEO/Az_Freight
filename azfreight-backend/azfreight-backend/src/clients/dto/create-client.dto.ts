import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEmail, IsBoolean, IsEnum, IsDateString, Length } from 'class-validator';

export class CreateClientDto {
  @IsString() @IsNotEmpty()
  companyName: string;

  @IsOptional() @IsString()
  taxId?: string;

  @IsOptional() @IsString() @Length(10, 10)
  voen?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsString()
  country?: string;

  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  website?: string;

  @IsOptional() @IsNumber()
  paymentTermsDays?: number;

  @IsOptional() @IsNumber()
  creditLimit?: number;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsEnum(['REGULAR', 'SILVER', 'GOLD', 'PLATINUM'])
  loyaltyStatus?: string;

  @IsOptional() @IsString()
  division?: string;

  @IsOptional() @IsString()
  contractNumber?: string;

  @IsOptional() @IsDateString()
  contractStart?: string;

  @IsOptional() @IsDateString()
  contractEnd?: string;

  @IsOptional() @IsString()
  contractDetails?: string;

  @IsOptional() @IsEnum(['CIA', 'COD', 'NET7', 'NET15', 'NET30', 'NET60', 'NET90'])
  paymentTerms?: string;

  @IsOptional() @IsNumber()
  creditTermDays?: number;

  @IsOptional() @IsNumber()
  insuranceLimit?: number;

  @IsOptional() @IsString()
  ogLicense?: string;

  @IsOptional() @IsBoolean()
  isBlacklisted?: boolean;

  @IsOptional() @IsString()
  blacklistReason?: string;
}

export class CreateClientContactDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  role?: string;
}

export class CreateAVLEntryDto {
  @IsString() @IsNotEmpty()
  vendorName: string;

  @IsOptional() @IsString()
  serviceType?: string;

  @IsOptional() @IsEnum(['IN_PROGRESS', 'APPROVED', 'REJECTED'])
  status?: string;

  @IsOptional() @IsString()
  rejectedReason?: string;

  @IsOptional() @IsDateString()
  reviewDate?: string;

  @IsOptional() @IsString()
  documentUrl?: string;

  @IsOptional() @IsString()
  notes?: string;
}

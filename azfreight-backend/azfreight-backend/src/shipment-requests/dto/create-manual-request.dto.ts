import { IsEmail, IsOptional, IsString, IsNumber, IsBoolean, IsArray, MinLength } from 'class-validator';

export class CreateManualRequestDto {
  // Contact resolution: provide ONE of clientId, leadId, or new contact fields
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  // New contact fields (used if no clientId/leadId)
  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  contactCompany?: string;

  // Standard request fields
  @IsString()
  originCountry: string;

  @IsString()
  originCity: string;

  @IsString()
  destinationCountry: string;

  @IsString()
  destinationCity: string;

  @IsString()
  cargoType: string;

  @IsOptional()
  @IsString()
  cargoSubtype?: string;

  @IsString()
  @MinLength(3)
  cargoDescription: string;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  volumeCbm?: number;

  @IsOptional()
  @IsNumber()
  packageCount?: number;

  @IsOptional()
  @IsNumber()
  declaredValue?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  incoterms?: string;

  @IsOptional()
  @IsString()
  hsCode?: string;

  @IsOptional()
  @IsArray()
  transportTypes?: string[];

  @IsOptional()
  @IsArray()
  transportOrder?: string[];

  @IsOptional()
  @IsString()
  preferredDate?: string;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

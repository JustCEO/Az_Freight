import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsIn,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

const CARGO_TYPES = [
  'electronics', 'food', 'chemicals', 'pharma', 'machinery', 'clothing',
  'alcohol_tobacco', 'weapons_ammo', 'animals', 'plants', 'vehicles', 'other',
];

const TRANSPORT_TYPES = ['road_tir', 'sea', 'air', 'rail', 'multimodal'];

export class CreateShipmentRequestDto {
  @IsString()
  @MinLength(2)
  requesterName: string;

  @IsEmail()
  requesterEmail: string;

  @IsOptional()
  @IsString()
  requesterPhone?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsString()
  originCountry: string;

  @IsString()
  originCity: string;

  @IsString()
  destinationCountry: string;

  @IsString()
  destinationCity: string;

  @IsIn(CARGO_TYPES)
  cargoType: string;

  @IsString()
  @MinLength(3)
  cargoDescription: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  volumeCbm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  packageCount?: number;

  @IsOptional()
  @Type(() => Number)
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

  @IsIn(TRANSPORT_TYPES)
  transportType: string;

  @IsOptional()
  @IsString()
  preferredDate?: string;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @IsObject()
  specialRequirements?: Record<string, unknown>;
}

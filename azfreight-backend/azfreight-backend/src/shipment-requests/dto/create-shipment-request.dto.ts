import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsArray,
  MinLength,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

const CARGO_TYPES = [
  'electronics', 'food_beverage', 'clothing_textile', 'chemicals', 'pharma',
  'machinery', 'automotive', 'construction', 'furniture', 'oil_gas',
  'alcohol_tobacco', 'animals', 'plants', 'other',
  // обратная совместимость со старыми типами
  'food', 'clothing', 'weapons_ammo', 'vehicles',
];

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

  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'VOEN must be exactly 10 digits' })
  voen?: string;

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

  // Мультимодальная доставка: массив типов транспорта
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return [value]; }
    }
    return value;
  })
  @IsArray()
  transportTypes?: string[];

  // Порядок следования этапов
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return [value]; }
    }
    return value;
  })
  @IsArray()
  transportOrder?: string[];

  @IsOptional()
  @IsString()
  preferredDate?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value === 'true';
    return value;
  })
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return value; }
    }
    return value;
  })
  @IsObject()
  specialRequirements?: Record<string, unknown>;
}

import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsInt } from 'class-validator';

export class CreateShipmentDto {
  @IsEnum(['road_tir', 'sea', 'air', 'rail'])
  transportType: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsString()
  @IsNotEmpty()
  originCountry: string;

  @IsString()
  @IsNotEmpty()
  originCity: string;

  @IsOptional()
  @IsString()
  originAddress?: string;

  @IsString()
  @IsNotEmpty()
  destinationCountry: string;

  @IsString()
  @IsNotEmpty()
  destinationCity: string;

  @IsOptional()
  @IsString()
  destinationAddress?: string;

  @IsOptional()
  @IsString()
  cargoDescription?: string;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  volumeCbm?: number;

  @IsOptional()
  @IsInt()
  packageCount?: number;

  @IsOptional()
  @IsString()
  hsCode?: string;

  @IsOptional()
  @IsString()
  incoterms?: string;

  @IsOptional()
  @IsNumber()
  clientRate?: number;

  @IsOptional()
  @IsNumber()
  carrierRate?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  vesselName?: string;

  @IsOptional()
  @IsString()
  containerNumber?: string;

  @IsOptional()
  @IsString()
  awbNumber?: string;

  @IsOptional()
  @IsString()
  wagonNumber?: string;

  @IsOptional()
  @IsString()
  tirNumber?: string;

  @IsOptional()
  @IsDateString()
  eta?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

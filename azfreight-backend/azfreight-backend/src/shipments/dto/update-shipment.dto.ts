import { IsEnum, IsOptional, IsString, IsNumber, IsDateString, IsInt } from 'class-validator';

export class UpdateShipmentDto {
  @IsOptional()
  @IsEnum(['road_tir', 'sea', 'air', 'rail'])
  transportType?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  originCountry?: string;

  @IsOptional()
  @IsString()
  originCity?: string;

  @IsOptional()
  @IsString()
  originAddress?: string;

  @IsOptional()
  @IsString()
  destinationCountry?: string;

  @IsOptional()
  @IsString()
  destinationCity?: string;

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
  @IsDateString()
  atd?: string;

  @IsOptional()
  @IsDateString()
  ata?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string | null;

  @IsOptional()
  @IsString()
  driverId?: string | null;

  @IsOptional()
  @IsString()
  notes?: string;
}

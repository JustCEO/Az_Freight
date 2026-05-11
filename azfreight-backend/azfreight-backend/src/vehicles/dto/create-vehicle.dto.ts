import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @IsString() @IsNotEmpty() plateNumber: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsInt() year?: number;
  @IsOptional() @IsString() vin?: string;
  @IsOptional() @IsNumber() capacityTons?: number;
  @IsOptional() @IsNumber() volumeCbm?: number;
  @IsOptional() @IsDateString() insuranceExpiry?: string;
  @IsOptional() @IsDateString() inspectionExpiry?: string;
  @IsOptional() @IsDateString() tirCarnetExpiry?: string;
  @IsOptional() @IsString() gpsTrackerId?: string;
  @IsOptional() @IsString() gpsProvider?: string;
  @IsOptional() @IsString() fuelType?: string;
  @IsOptional() @IsString() trailerType?: string;
  @IsOptional() @IsNumber() tareWeightKg?: number;
  @IsOptional() @IsDateString() lastMaintenanceDate?: string;
  @IsOptional() @IsString() maintenanceNotes?: string;
}

import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional() @IsString() plateNumber?: string;
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
  @IsOptional() @IsEnum(['available', 'on_route', 'maintenance', 'inactive']) status?: string;
  @IsOptional() @IsString() fuelType?: string;
  @IsOptional() @IsString() trailerType?: string;
  @IsOptional() @IsNumber() tareWeightKg?: number;
  @IsOptional() @IsDateString() lastMaintenanceDate?: string;
  @IsOptional() @IsString() maintenanceNotes?: string;
  @IsOptional() @IsString() driverId?: string;
}

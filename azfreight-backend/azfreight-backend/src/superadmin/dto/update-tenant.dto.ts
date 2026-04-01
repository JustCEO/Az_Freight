import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

// DTO для обновления данных тенанта
export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  maxUsers?: number;

  @IsOptional()
  @IsInt()
  maxShipmentsMonth?: number;
}

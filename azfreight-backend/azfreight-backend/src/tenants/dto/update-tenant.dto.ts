import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Prisma } from '@prisma/client';

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  settings?: Prisma.InputJsonValue;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

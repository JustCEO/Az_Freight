import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';

// DTO для создания нового тенанта с администратором
export class CreateTenantDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  plan?: string = 'starter';

  @IsString()
  adminName: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(6)
  adminPassword: string;
}

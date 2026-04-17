import { IsBoolean, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength, ValidateIf } from 'class-validator';

const ASSIGNABLE_ROLES = ['admin', 'director', 'hr', 'manager', 'logistics_agent', 'dispatcher', 'warehouse_manager', 'accountant', 'client'];

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @ValidateIf((o) => !o.sendInvitation)
  @IsString()
  @MinLength(8)
  password?: string;

  @IsEnum(ASSIGNABLE_ROLES)
  role: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  sendInvitation?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  invitationExpiresInDays?: number;
}

import { IsEmail, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  expiresInDays?: number = 7;
}

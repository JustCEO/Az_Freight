import { IsString, IsUUID, MinLength, IsOptional } from 'class-validator';

export class RegisterByInviteDto {
  @IsUUID()
  token: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

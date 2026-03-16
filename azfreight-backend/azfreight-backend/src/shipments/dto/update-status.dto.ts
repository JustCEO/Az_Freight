import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsEnum(['request', 'confirmed', 'in_transit', 'customs', 'delivered', 'cancelled'])
  status: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

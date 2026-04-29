import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateExpenseDto {
  @IsOptional()
  @IsEnum([
    'customs_duty',
    'storage',
    'insurance',
    'port_charges',
    'bank_fee',
    'transport',
    'documentation',
    'vat',
    'other',
  ])
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  vatRate?: number;

  @IsOptional()
  @IsString()
  date?: string;
}

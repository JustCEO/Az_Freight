import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  shipmentId: string;

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
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  amount: number;

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

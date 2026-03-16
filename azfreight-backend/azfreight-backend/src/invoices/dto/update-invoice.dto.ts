import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsDateString()
  issuedDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @IsOptional()
  @IsDateString()
  paidDate?: string;

  @IsOptional()
  lineItems?: unknown;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInvoiceStatusDto {
  @IsEnum(['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled'])
  status: string;
}

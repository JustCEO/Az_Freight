import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsOptional()
  @IsString()
  shipmentId?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsDateString()
  issuedDate: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  lineItems?: unknown;

  @IsOptional()
  @IsString()
  notes?: string;
}

import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuoteLineDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsNumber()
  unitPrice: number;
}

export class CreateQuoteDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsString()
  @IsNotEmpty()
  originCountry: string;

  @IsString()
  @IsNotEmpty()
  originCity: string;

  @IsString()
  @IsNotEmpty()
  destCountry: string;

  @IsString()
  @IsNotEmpty()
  destCity: string;

  @IsString()
  @IsNotEmpty()
  transportType: string;

  @IsOptional()
  @IsString()
  cargoType?: string;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  volumeCbm?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  vatRate?: number;

  @IsOptional()
  @IsNumber()
  margin?: number;

  @IsOptional()
  @IsNumber()
  validDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLineDto)
  lines: QuoteLineDto[];
}

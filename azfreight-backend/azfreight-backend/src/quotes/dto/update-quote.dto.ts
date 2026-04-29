import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuoteLineDto } from './create-quote.dto';

export class UpdateQuoteDto {
  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsString()
  originCountry?: string;

  @IsOptional()
  @IsString()
  originCity?: string;

  @IsOptional()
  @IsString()
  destCountry?: string;

  @IsOptional()
  @IsString()
  destCity?: string;

  @IsOptional()
  @IsString()
  transportType?: string;

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

  @IsOptional()
  @IsEnum(['draft', 'sent', 'accepted', 'rejected', 'expired'])
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLineDto)
  lines?: QuoteLineDto[];
}

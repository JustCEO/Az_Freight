import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @IsString()
  @IsNotEmpty()
  originalName: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsInt()
  sizeBytes: number;

  @IsEnum(['cmr', 'bill_of_lading', 'awb', 'rail_waybill', 'invoice', 'packing_list', 'certificate', 'declaration', 'contract', 'scan_signed', 'other'])
  docType: string;

  @IsString()
  @IsNotEmpty()
  linkedEntityType: string;

  @IsString()
  @IsNotEmpty()
  linkedEntityId: string;

  @IsOptional()
  @IsString()
  parentDocumentId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

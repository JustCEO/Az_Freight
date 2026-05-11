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

  @IsString()
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

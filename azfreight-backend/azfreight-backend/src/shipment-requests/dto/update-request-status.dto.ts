import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateRequestStatusDto {
  @IsOptional()
  @IsIn(['new', 'reviewing', 'quoted', 'rejected', 'converted'])
  status?: string;

  @IsOptional()
  @IsIn(['OPEN', 'QUOTATION', 'REPLIED', 'CONVERTED', 'CLOSED'])
  requestStatus?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

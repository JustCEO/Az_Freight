import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateRequestStatusDto {
  @IsIn(['new', 'reviewing', 'quoted', 'rejected', 'converted'])
  status: string;

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

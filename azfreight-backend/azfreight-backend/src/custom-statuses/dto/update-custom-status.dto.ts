import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateCustomStatusDto {
  /** Название статуса */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  /** HEX-цвет статуса */
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color должен быть HEX-цветом вида #RRGGBB' })
  color?: string;

  /** Порядок сортировки */
  @IsOptional()
  @IsInt()
  order?: number;

  /** Статус по умолчанию */
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

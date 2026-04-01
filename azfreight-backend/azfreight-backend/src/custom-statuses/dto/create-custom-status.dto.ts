import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCustomStatusDto {
  /** Название статуса */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  /** HEX-цвет статуса */
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color должен быть HEX-цветом вида #RRGGBB' })
  color?: string = '#6B7280';

  /** Порядок сортировки */
  @IsOptional()
  @IsInt()
  order?: number = 0;

  /** Статус по умолчанию */
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}

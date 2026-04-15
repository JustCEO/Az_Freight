import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

const BUILT_IN_STATUSES = ['request', 'confirmed', 'in_transit', 'customs', 'delivered', 'cancelled'];

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

  /** Встроенный жизненный цикл, который расширяет этот кастомный статус */
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @IsIn(BUILT_IN_STATUSES)
  parentStatus?: string | null;
}

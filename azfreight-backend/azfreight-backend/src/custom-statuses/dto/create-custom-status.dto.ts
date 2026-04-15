import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const BUILT_IN_STATUSES = ['request', 'confirmed', 'in_transit', 'customs', 'delivered', 'cancelled'];

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

  /** Встроенный жизненный цикл, который расширяет этот кастомный статус */
  @IsOptional()
  @IsString()
  @IsIn(BUILT_IN_STATUSES)
  parentStatus?: string;
}

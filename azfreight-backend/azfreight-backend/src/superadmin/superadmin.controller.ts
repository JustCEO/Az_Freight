import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/superadmin.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { SuperAdminService } from './superadmin.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

// Контроллер суперадмина — управление тенантами и платформой
@Controller('superadmin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  // Получение списка всех тенантов со статистикой
  @Get('tenants')
  listTenants() {
    return this.superAdminService.listTenants();
  }

  // Создание нового тенанта с администратором
  @Post('tenants')
  createTenant(@Body() dto: CreateTenantDto) {
    return this.superAdminService.createTenant(dto);
  }

  // Обновление данных тенанта (план, имя, лимиты и т.д.)
  @Patch('tenants/:id')
  updateTenant(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.superAdminService.updateTenant(id, dto);
  }

  // Деактивация тенанта (мягкое удаление — isActive = false)
  @Delete('tenants/:id')
  deactivateTenant(@Param('id') id: string) {
    return this.superAdminService.deactivateTenant(id);
  }

  // Полное удаление тенанта и всех данных
  @Delete('tenants/:id/permanent')
  deleteTenantPermanently(@Param('id') id: string) {
    return this.superAdminService.deleteTenant(id);
  }

  // Получение пользователей конкретного тенанта
  @Get('tenants/:id/users')
  getTenantUsers(@Param('id') id: string) {
    return this.superAdminService.getTenantUsers(id);
  }

  // Все пользователи всей платформы (для группировки по тенанту)
  @Get('users')
  getAllUsers() {
    return this.superAdminService.getAllUsers();
  }

  // Создание приглашения для тенанта
  @Post('tenants/:id/invite')
  inviteToTenant(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { email: string; role: string; expiresInDays?: number },
  ) {
    return this.superAdminService.inviteToTenant(id, user.sub, body);
  }

  // Привязка существующего пользователя или создание нового в тенанте
  @Post('tenants/:id/assign-user')
  assignUserToTenant(
    @Param('id') id: string,
    @Body() body: { userId?: string; email?: string; name?: string; role?: string; password?: string },
  ) {
    return this.superAdminService.assignUserToTenant(id, body);
  }

  // Общая статистика платформы
  @Get('stats')
  getStats() {
    return this.superAdminService.getStats();
  }
}

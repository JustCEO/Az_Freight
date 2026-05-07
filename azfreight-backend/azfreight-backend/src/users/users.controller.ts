import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: PaginationDto) {
    return this.usersService.findAll(user.tenantId, query);
  }

  @Get('me/preferences')
  getPreferences(@CurrentUser() user: JwtPayload) {
    return this.usersService.getPreferences(user.sub);
  }

  @Patch('me/preferences')
  updatePreferences(@CurrentUser() user: JwtPayload, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(user.sub, dto);
  }

  @Post()
  @Roles('admin')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateUserDto) {
    return this.usersService.create(user.tenantId, dto, user.role);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.findOne(user.tenantId, id);
  }

  @Put(':id')
  @Roles('admin')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.tenantId, id, dto, user.role);
  }

  @Patch(':id/toggle-active')
  @Roles('admin')
  toggleActive(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.usersService.toggleActive(user.tenantId, user.sub, id, body.isActive);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.remove(user.tenantId, id);
  }

  @Delete(':id/permanent')
  @Roles('admin', 'superadmin', 'director')
  deletePermanently(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.deletePermanently(user.tenantId, id);
  }
}

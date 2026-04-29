import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ShipmentRequestsService } from './shipment-requests.service';
import { CreateShipmentRequestDto } from './dto/create-shipment-request.dto';
import { CreateManualRequestDto } from './dto/create-manual-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { FilterRequestsDto } from './dto/filter-requests.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller()
export class ShipmentRequestsController {
  constructor(private service: ShipmentRequestsService) {}

  @Post('public/:tenantSlug/requests')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files', maxCount: 10 }], {
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  createPublic(
    @Param('tenantSlug') tenantSlug: string,
    @Body() dto: CreateShipmentRequestDto,
    @UploadedFiles() uploadedFiles?: { files?: Express.Multer.File[] },
  ) {
    const docTypes = Array.isArray(dto.specialRequirements?.fileDocTypes)
      ? (dto.specialRequirements.fileDocTypes as string[])
      : undefined;
    return this.service.createPublic(tenantSlug, dto, uploadedFiles?.files, docTypes);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  @Post('shipment-requests/manual')
  createManual(@CurrentUser() user: JwtPayload, @Body() dto: CreateManualRequestDto) {
    return this.service.createManual(user.tenantId, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Get('shipment-requests')
  findAll(@CurrentUser() user: JwtPayload, @Query() query: FilterRequestsDto) {
    return this.service.findAll(user.tenantId, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('shipment-requests/search-contacts')
  async searchContacts(@CurrentUser() user: JwtPayload, @Query('q') q: string) {
    return this.service.searchContacts(user.tenantId, q || '');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Get('shipment-requests/new-count')
  getNewCount(@CurrentUser() user: JwtPayload) {
    return this.service.getNewCount(user.tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Get('shipment-requests/:id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.findOne(user.tenantId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Patch('shipment-requests/:id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateRequestStatusDto,
  ) {
    return this.service.updateStatus(user.tenantId, id, dto);
  }

  // Назначить перевозчика на запрос
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Patch('shipment-requests/:id/assign-carrier')
  assignCarrier(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { carrierId: string },
  ) {
    return this.service.assignCarrier(user.tenantId, id, body.carrierId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Post('shipment-requests/:id/convert')
  convert(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.convert(user.tenantId, id, user.sub);
  }
}

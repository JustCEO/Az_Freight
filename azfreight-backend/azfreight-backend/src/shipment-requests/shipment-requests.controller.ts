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
    @Body('docTypes') docTypes?: string,
  ) {
    let parsedDocTypes: string[] | undefined;
    if (docTypes) {
      try { parsedDocTypes = JSON.parse(docTypes); } catch { /* ignore */ }
    }
    return this.service.createPublic(tenantSlug, dto, uploadedFiles?.files, parsedDocTypes);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Get('shipment-requests')
  findAll(@CurrentUser() user: JwtPayload, @Query() query: FilterRequestsDto) {
    return this.service.findAll(user.tenantId, query);
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @Post('shipment-requests/:id/convert')
  convert(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.convert(user.tenantId, id, user.sub);
  }
}

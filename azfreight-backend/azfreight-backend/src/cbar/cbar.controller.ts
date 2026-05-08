import { Controller, Get, Query } from '@nestjs/common';
import { CbarService } from './cbar.service';

@Controller('cbar')
export class CbarController {
  constructor(private readonly cbarService: CbarService) {}

  @Get('rates')
  getRates(@Query('date') date?: string) {
    return this.cbarService.getRates(date);
  }
}

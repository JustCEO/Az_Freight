import { Module } from '@nestjs/common';
import { CbarController } from './cbar.controller';
import { CbarService } from './cbar.service';

@Module({
  controllers: [CbarController],
  providers: [CbarService],
  exports: [CbarService],
})
export class CbarModule {}

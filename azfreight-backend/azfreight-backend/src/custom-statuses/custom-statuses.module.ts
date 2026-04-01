import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomStatusesController } from './custom-statuses.controller';
import { CustomStatusesService } from './custom-statuses.service';

@Module({
  imports: [PrismaModule],
  controllers: [CustomStatusesController],
  providers: [CustomStatusesService],
  exports: [CustomStatusesService],
})
export class CustomStatusesModule {}

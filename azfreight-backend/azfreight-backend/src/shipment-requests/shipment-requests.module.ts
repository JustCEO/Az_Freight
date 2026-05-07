import { Module } from '@nestjs/common';
import { ShipmentRequestsController } from './shipment-requests.controller';
import { ShipmentRequestsService } from './shipment-requests.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ShipmentRequestsController],
  providers: [ShipmentRequestsService],
})
export class ShipmentRequestsModule {}

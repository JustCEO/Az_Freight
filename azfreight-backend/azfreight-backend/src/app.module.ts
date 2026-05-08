import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { ClientsModule } from './clients/clients.module';
import { CarriersModule } from './carriers/carriers.module';
import { DocumentsModule } from './documents/documents.module';
import { InvoicesModule } from './invoices/invoices.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DriversModule } from './drivers/drivers.module';
import { InvitationsModule } from './invitations/invitations.module';
import { ShipmentRequestsModule } from './shipment-requests/shipment-requests.module';
import { PortalModule } from './portal/portal.module';
import { CustomStatusesModule } from './custom-statuses/custom-statuses.module';
import { SuperAdminModule } from './superadmin/superadmin.module';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { ReportsModule } from './reports/reports.module';
import { LeadsModule } from './leads/leads.module';
import { PortalAuthModule } from './portal-auth/portal-auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { QuotesModule } from './quotes/quotes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CbarModule } from './cbar/cbar.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    MailModule,
    PrismaModule,
    StorageModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    ShipmentsModule,
    ClientsModule,
    CarriersModule,
    DocumentsModule,
    InvoicesModule,
    VehiclesModule,
    DriversModule,
    InvitationsModule,
    ShipmentRequestsModule,
    PortalModule,
    SuperAdminModule,
    CustomStatusesModule,
    ReportsModule,
    LeadsModule,
    PortalAuthModule,
    ExpensesModule,
    QuotesModule,
    NotificationsModule,
    CbarModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule {}

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ShipmentsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let tenantId: string;
  let clientId: string;
  let shipmentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    // Register and login
    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        tenantName: 'Shipment Test Co',
        tenantSlug: 'shipment-test',
        name: 'Admin',
        email: 'admin@shipment-test.com',
        password: 'password123',
      });
    accessToken = registerRes.body.accessToken;
    tenantId = registerRes.body.tenant.id;

    // Create a client for shipments
    const clientRes = await request(app.getHttpServer())
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ companyName: 'Test Client Corp', country: 'AZ', city: 'Baku' });
    clientId = clientRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/shipments', () => {
    it('should create a shipment', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          transportType: 'road_tir',
          clientId,
          originCountry: 'AZ',
          originCity: 'Baku',
          destinationCountry: 'TR',
          destinationCity: 'Istanbul',
          cargoDescription: 'Electronics',
          weightKg: 5000,
          clientRate: 3000,
          carrierRate: 2200,
        })
        .expect(201);

      shipmentId = res.body.id;
      expect(res.body.referenceNumber).toMatch(/^SHP-\d{8}-\d{4}$/);
      expect(res.body.status).toBe('request');
      expect(Number(res.body.profit)).toBe(800);
    });

    it('should reject shipment without required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ transportType: 'road_tir' })
        .expect(400);
    });
  });

  describe('GET /api/v1/shipments', () => {
    it('should list shipments', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/shipments')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/shipments/:id', () => {
    it('should get a shipment by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/shipments/${shipmentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(shipmentId);
    });
  });

  describe('PATCH /api/v1/shipments/:id/status — workflow validation', () => {
    it('should transition from request to confirmed', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'confirmed', comment: 'Confirmed by manager' })
        .expect(200);

      expect(res.body.status).toBe('confirmed');
    });

    it('should reject invalid transition from confirmed to delivered', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'delivered' })
        .expect(400);
    });

    it('should transition from confirmed to in_transit', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'in_transit' })
        .expect(200);

      expect(res.body.status).toBe('in_transit');
    });

    it('should transition from in_transit to customs', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'customs' })
        .expect(200);

      expect(res.body.status).toBe('customs');
    });

    it('should transition from customs to delivered', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'delivered', comment: 'Delivered to destination' })
        .expect(200);

      expect(res.body.status).toBe('delivered');
    });

    it('should reject transition from delivered (terminal state)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'cancelled' })
        .expect(400);
    });
  });

  describe('GET /api/v1/shipments/:id/timeline', () => {
    it('should return status change history', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/shipments/${shipmentId}/timeline`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(4); // request→confirmed→in_transit→customs→delivered
      expect(res.body[0].oldStatus).toBe('request');
      expect(res.body[0].newStatus).toBe('confirmed');
    });
  });

  describe('Cancellation workflow', () => {
    it('should allow cancellation from request state', async () => {
      // Create a new shipment
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          transportType: 'sea',
          clientId,
          originCountry: 'AZ',
          originCity: 'Baku',
          destinationCountry: 'DE',
          destinationCity: 'Hamburg',
        });

      const newShipmentId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${newShipmentId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'cancelled', comment: 'Client cancelled' })
        .expect(200);

      expect(res.body.status).toBe('cancelled');
    });
  });
});

# AzFreight — Гайд по доработке через Claude

Этот документ — полная инструкция для продолжения разработки AzFreight с помощью Claude (Opus / Sonnet). Содержит текущее состояние, архитектуру, контракты API, и детальные задачи на каждый модуль.

---

## 1. Текущее состояние проекта

### Что уже реализовано

| Компонент | Статус | Описание |
|-----------|--------|----------|
| Backend (NestJS) | ✅ Готов | 69 файлов, 2782 LOC, 0 ошибок TypeScript |
| Frontend (Next.js) | ✅ Готов | 40 файлов, 3279 LOC, 0 ошибок билда |
| PostgreSQL (Prisma) | ✅ Готов | 14 таблиц, multi-tenant, миграции |
| Auth (JWT) | ✅ Готов | Register, login, refresh, logout, RBAC |
| Shipments | ✅ Готов | CRUD + workflow статусов + timeline |
| Clients / Carriers | ✅ Готов | CRUD с пагинацией |
| Invoices | ✅ Готов | CRUD с привязкой к клиенту/отправке |
| Documents | ✅ Частично | Только метаданные (нет загрузки файлов) |
| Vehicles | ✅ Backend | CRUD есть, нет страницы на фронте |
| Client Portal | ✅ Готов | /portal/shipments (read-only) |

### Чего нет (план на доработку)

| Модуль | Приоритет | Описание |
|--------|-----------|----------|
| Загрузка файлов (S3/MinIO) | 🔴 Высокий | Реальное хранение документов |
| Multi-tenancy (полная) | 🔴 Высокий | Tenant middleware + seed первого тенанта |
| Котировки (Quotes) | 🟡 Средний | Новый CRUD модуль |
| Таможня (Customs) | 🟡 Средний | Декларации, HS-коды |
| WhatsApp / Telegram | 🟡 Средний | Омниканальные уведомления |
| AI (Google Gemini) | 🟡 Средний | OCR, чатбот, классификация |
| Трекинг грузов | 🟡 Средний | MarineTraffic, GPS, FlightAware |
| Курсы валют (CBAR) | 🟢 Низкий | Ежедневный pull курсов ЦБ Азербайджана |
| Workflow Engine | 🟢 Низкий | Temporal.io для автоматизации |
| Полнотекстовый поиск | 🟢 Низкий | Meilisearch |

---

## 2. Архитектура и соглашения

### Технологии

```
Backend:  NestJS 10 + TypeScript + Prisma ORM + PostgreSQL 16
Frontend: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
Auth:     JWT (access 15m + refresh 7d), RBAC (admin, manager, accountant, client)
API:      REST, prefix /api/v1, JSON
```

### Паттерны Backend (NestJS)

```
src/
├── <module>/
│   ├── <module>.controller.ts   # REST эндпоинты, декораторы @Roles, @UseGuards
│   ├── <module>.service.ts      # Бизнес-логика, работа с Prisma
│   ├── <module>.module.ts       # NestJS модуль
│   └── dto/
│       ├── create-<entity>.dto.ts   # class-validator декораторы
│       └── update-<entity>.dto.ts
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts    # Проверка JWT
│   │   └── roles.guard.ts       # Проверка роли
│   ├── decorators/
│   │   ├── current-user.decorator.ts  # @CurrentUser()
│   │   └── roles.decorator.ts         # @Roles('admin', 'manager')
│   ├── middleware/
│   │   └── tenant.middleware.ts  # Извлечение tenant_id из JWT
│   ├── interceptors/
│   │   └── audit-log.interceptor.ts
│   └── dto/
│       └── pagination.dto.ts    # page, limit, search
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── config/
    └── configuration.ts
```

### Паттерны Frontend (Next.js)

```
src/
├── app/
│   ├── (auth)/          # Layout без sidebar (login, register)
│   ├── (dashboard)/     # Layout с sidebar (для операторов)
│   └── (portal)/        # Layout с порталом (для клиентов)
├── components/          # Переиспользуемые компоненты
├── context/
│   └── auth-context.tsx # JWT хранение, auto-refresh, ролевой редирект
├── lib/
│   ├── api-client.ts    # Axios instance, interceptor на 401 → refresh
│   └── api/             # Модульные функции: getShipments(), createClient() и т.д.
└── types/
    └── index.ts         # Все TypeScript интерфейсы
```

### Правила при добавлении нового модуля

#### Backend:
1. Создать Prisma-модель в `prisma/schema.prisma` (с `tenantId`)
2. Запустить `npx prisma migrate dev --name <описание>`
3. Создать папку `src/<module>/` с controller, service, module, dto
4. Зарегистрировать модуль в `src/app.module.ts`
5. Добавить guards: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles()`

#### Frontend:
1. Добавить типы в `src/types/index.ts`
2. Создать API-функции в `src/lib/api/<module>.ts`
3. Создать страницы в `src/app/(dashboard)/<module>/`
4. Добавить ссылку в sidebar (`src/components/sidebar.tsx`)

---

## 3. Схема базы данных (Prisma)

Текущие модели в `prisma/schema.prisma`:

```
Tenant, User, Client, ClientContact, Carrier, CarrierContact,
Shipment, ShipmentStatusLog, Invoice, Document, Vehicle, AuditLog
```

Каждая модель (кроме Tenant) содержит `tenantId String` для мультитенантности.

### Модели для добавления (по архитектуре v2):

```prisma
// Котировки
model Quote {
  id              String   @id @default(uuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  referenceNumber String
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  transportType   String   // road, sea, air, rail
  origin          String
  destination     String
  cargoDescription String?
  weight          Decimal?
  volume          Decimal?
  clientRate      Decimal
  carrierRate     Decimal?
  currency        String   @default("USD")
  validUntil      DateTime
  status          String   @default("draft") // draft, sent, accepted, rejected, expired, converted
  shipmentId      String?  // если конвертирована в отправку
  shipment        Shipment? @relation(fields: [shipmentId], references: [id])
  notes           String?
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Тарифные карты перевозчиков
model RateCard {
  id            String   @id @default(uuid())
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  carrierId     String
  carrier       Carrier  @relation(fields: [carrierId], references: [id])
  transportType String
  origin        String
  destination   String
  rate          Decimal
  currency      String   @default("USD")
  validFrom     DateTime
  validTo       DateTime
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Таможенные декларации
model CustomsDeclaration {
  id                String   @id @default(uuid())
  tenantId          String
  tenant            Tenant   @relation(fields: [tenantId], references: [id])
  shipmentId        String
  shipment          Shipment @relation(fields: [shipmentId], references: [id])
  declarationNumber String?
  hsCode            String?
  status            String   @default("pending") // pending, filed, inspection, cleared, rejected
  filedAt           DateTime?
  clearedAt         DateTime?
  dutyAmount        Decimal?
  vatAmount         Decimal?
  currency          String   @default("AZN")
  notes             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// Уведомления (для WhatsApp, Telegram, Email, SMS)
model Notification {
  id          String   @id @default(uuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  channel     String   // email, sms, whatsapp, telegram
  recipientId String?  // userId или clientId
  recipient   String   // email, phone, chatId
  subject     String?
  body        String
  status      String   @default("pending") // pending, sent, delivered, failed
  relatedType String?  // shipment, invoice, quote
  relatedId   String?
  sentAt      DateTime?
  error       String?
  createdAt   DateTime @default(now())
}

// Курсы валют (CBAR)
model ExchangeRate {
  id       String   @id @default(uuid())
  date     DateTime
  currency String   // USD, EUR, GBP, RUB, TRY...
  rate     Decimal  // курс к AZN
  source   String   @default("CBAR")
  createdAt DateTime @default(now())

  @@unique([date, currency])
}

// Сообщения (омниканальный inbox)
model Message {
  id          String   @id @default(uuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  channel     String   // whatsapp, telegram, email
  direction   String   // inbound, outbound
  externalId  String?  // ID из WhatsApp/Telegram
  senderId    String?
  senderName  String?
  senderPhone String?
  body        String
  mediaUrl    String?
  clientId    String?
  client      Client?  @relation(fields: [clientId], references: [id])
  shipmentId  String?
  assignedTo  String?  // userId менеджера
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}

// Трекинг грузов
model TrackingEvent {
  id          String   @id @default(uuid())
  tenantId    String
  shipmentId  String
  shipment    Shipment @relation(fields: [shipmentId], references: [id])
  source      String   // marinetraffic, wialon, flightaware, manual
  externalId  String?
  status      String
  location    String?
  latitude    Decimal?
  longitude   Decimal?
  eta         DateTime?
  details     Json?
  recordedAt  DateTime
  createdAt   DateTime @default(now())
}
```

---

## 4. Детальные задачи по модулям

### 4.1 Загрузка файлов (S3 / MinIO)

**Цель:** Реальное хранение документов вместо только метаданных.

**Шаги:**
1. Установить `@aws-sdk/client-s3` и `@aws-sdk/s3-request-presigner`
2. Создать `src/storage/storage.service.ts`:
   - `uploadFile(file, key)` — загрузка в S3/MinIO
   - `getPresignedUrl(key)` — временная ссылка на скачивание (TTL 15 мин)
   - `deleteFile(key)` — удаление
3. Добавить в `.env`:
   ```
   S3_ENDPOINT=http://localhost:9000
   S3_BUCKET=azfreight-docs
   S3_ACCESS_KEY=minioadmin
   S3_SECRET_KEY=minioadmin
   S3_REGION=us-east-1
   ```
4. Обновить `documents.controller.ts`:
   - `POST /documents/upload` — multipart upload (используй `@nestjs/platform-express` + Multer)
   - `GET /documents/:id/download` — возвращает presigned URL
5. Обновить Prisma-модель `Document` — добавить `fileKey`, `fileSize`, `mimeType`
6. Добавить MinIO в `docker-compose.yml`:
   ```yaml
   minio:
     image: minio/minio
     command: server /data --console-address ":9001"
     ports:
       - '9000:9000'
       - '9001:9001'
     environment:
       MINIO_ROOT_USER: minioadmin
       MINIO_ROOT_PASSWORD: minioadmin
     volumes:
       - minio-data:/data
   ```
7. На фронте: компонент загрузки файлов (drag & drop) на странице отправки

### 4.2 Модуль котировок (Quotes)

**Цель:** Менеджер создаёт котировку → отправляет клиенту → клиент принимает → конвертация в отправку.

**Backend:**
1. Prisma-модель `Quote` (см. раздел 3)
2. `src/quotes/` — controller, service, module, dto
3. Эндпоинты:
   - `GET /api/v1/quotes` — список с фильтрами (status, clientId, transportType)
   - `POST /api/v1/quotes` — создать
   - `GET /api/v1/quotes/:id` — получить
   - `PATCH /api/v1/quotes/:id` — обновить
   - `DELETE /api/v1/quotes/:id` — удалить
   - `POST /api/v1/quotes/:id/send` — отправить клиенту (status → sent)
   - `POST /api/v1/quotes/:id/convert` — конвертировать в отправку (создаёт Shipment, status → converted)
4. Роли: admin, manager — полный доступ; client — только свои (read-only через портал)

**Frontend:**
1. Страницы: `/quotes`, `/quotes/new`, `/quotes/[id]`
2. На странице котировки: кнопки «Отправить клиенту», «Конвертировать в отправку»
3. Клиентский портал: `/portal/quotes` — список котировок, кнопки Accept/Reject
4. Ссылка в sidebar

### 4.3 Таможенный модуль (Customs)

**Цель:** Привязка таможенных деклараций к отправкам, отслеживание статуса оформления.

**Backend:**
1. Prisma-модель `CustomsDeclaration` (см. раздел 3)
2. `src/customs/` — controller, service, module, dto
3. Эндпоинты:
   - `GET /api/v1/customs` — список
   - `POST /api/v1/customs` — создать (привязка к shipmentId)
   - `GET /api/v1/customs/:id` — получить
   - `PATCH /api/v1/customs/:id` — обновить
   - `PATCH /api/v1/customs/:id/status` — сменить статус (с валидацией переходов)
4. Workflow статусов: `pending → filed → inspection → cleared` или `→ rejected`

**Frontend:**
1. Вкладка «Таможня» на странице отправки (`/shipments/[id]`)
2. Отдельная страница `/customs` — список всех деклараций с фильтрами
3. Цветовые бейджи статусов

### 4.4 Автопарк на фронте (Vehicles)

**Цель:** Backend уже есть — нужны страницы на фронте.

**Frontend:**
1. Страницы: `/vehicles`, `/vehicles/new`, `/vehicles/[id]`
2. API-функции в `src/lib/api/vehicles.ts` (уже есть бэкенд)
3. Карточка: номер, марка, модель, грузоподъёмность, VIN, страховка, техосмотр
4. Предупреждения об истечении страховки/техосмотра (подсветка красным)
5. Ссылка в sidebar

### 4.5 Доп. расходы (Charges & Surcharges)

**Цель:** Детализация расходов по каждой отправке (терминал, страховка, хранение, демередж).

**Backend:**
1. Prisma-модель:
   ```prisma
   model ShipmentCharge {
     id          String   @id @default(uuid())
     tenantId    String
     shipmentId  String
     shipment    Shipment @relation(fields: [shipmentId], references: [id])
     type        String   // terminal, insurance, storage, demurrage, inspection, other
     description String
     amount      Decimal
     currency    String   @default("USD")
     side        String   // cost (расход) | revenue (доход)
     createdAt   DateTime @default(now())
   }
   ```
2. Эндпоинты: CRUD для charges, привязанных к shipmentId
3. На фронте: таблица расходов/доходов на странице отправки + итоговый P&L

---

## 5. Промпты для Claude

Ниже — готовые промпты для передачи Claude при работе над каждым модулем. Копируй нужный блок и вставляй в чат.

### 5.1 Промпт: добавить модуль котировок

```
Проект AzFreight — NestJS + Prisma + PostgreSQL backend.
Добавь модуль котировок (Quotes).

Текущая структура: каждый модуль (shipments, clients, carriers, invoices) имеет
controller, service, module, dto/ папку. Используются guards: JwtAuthGuard, RolesGuard.
Декоратор @CurrentUser() возвращает { id, email, role, tenantId }.
Пагинация через PaginationDto (page, limit, search).

Prisma-модель Quote:
- id (uuid), tenantId, referenceNumber, clientId (FK → Client),
  transportType (road/sea/air/rail), origin, destination,
  cargoDescription, weight (Decimal), volume (Decimal),
  clientRate (Decimal), carrierRate (Decimal), currency (default "USD"),
  validUntil (DateTime), status (draft/sent/accepted/rejected/expired/converted),
  shipmentId (nullable FK → Shipment), notes, createdBy, createdAt, updatedAt

Эндпоинты:
- GET /api/v1/quotes (с пагинацией и фильтрами: status, clientId, transportType)
- POST /api/v1/quotes
- GET /api/v1/quotes/:id
- PATCH /api/v1/quotes/:id
- DELETE /api/v1/quotes/:id
- POST /api/v1/quotes/:id/send (status → sent)
- POST /api/v1/quotes/:id/convert (создать Shipment из котировки, status → converted)

Роли: admin и manager — полный доступ.
Приоритет — рабочий код, минимум комментариев.
```

### 5.2 Промпт: добавить загрузку файлов

```
Проект AzFreight — NestJS backend. Модуль documents уже существует (CRUD метаданных).
Добавь реальную загрузку файлов через S3/MinIO.

Шаги:
1. Создай src/storage/storage.service.ts и storage.module.ts
   - Использует @aws-sdk/client-s3 и @aws-sdk/s3-request-presigner
   - Методы: uploadFile(buffer, key, mime), getPresignedUrl(key, ttl), deleteFile(key)
   - Конфиг из .env: S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_REGION
2. Обнови documents.controller.ts:
   - POST /api/v1/documents/upload — multipart (Multer), сохраняет файл в S3, создаёт запись Document
   - GET /api/v1/documents/:id/download — возвращает { url: presignedUrl }
3. Обнови Prisma-модель Document — добавь поля fileKey, fileSize
4. Добавь MinIO сервис в docker-compose.yml

Не добавляй функционал электронных подписей. Только хранение файлов.
Приоритет — рабочий код, минимум комментариев.
```

### 5.3 Промпт: добавить WhatsApp интеграцию

```
Проект AzFreight — NestJS backend.
Добавь интеграцию с WhatsApp Business API через 360dialog.

Создай модуль src/messaging/:
1. messaging.service.ts:
   - sendWhatsAppMessage(phone, templateName, params) — отправка template message
   - sendWhatsAppText(phone, text) — отправка текстового сообщения
   - handleIncomingWebhook(body) — обработка входящих сообщений
2. messaging.controller.ts:
   - POST /api/v1/messaging/whatsapp/webhook — вебхук для входящих (без auth)
   - POST /api/v1/messaging/send — отправка сообщения (auth required)
   - GET /api/v1/messaging/conversations — список бесед (с пагинацией)
   - GET /api/v1/messaging/conversations/:clientId — история с клиентом
3. Prisma-модель Message (channel, direction, body, clientId, и т.д.)
4. Конфиг .env: WHATSAPP_API_URL, WHATSAPP_API_KEY, WHATSAPP_WEBHOOK_SECRET

API 360dialog: POST https://waba.360dialog.io/v1/messages
Header: D360-API-KEY: <key>
Body для template: { "to": "994XXXXXXXXX", "type": "template", "template": { "name": "...", "language": { "code": "ru" }, "components": [...] } }
Body для text: { "to": "994XXXXXXXXX", "type": "text", "text": { "body": "..." } }

Входящий webhook body: { "messages": [{ "from": "994...", "text": { "body": "..." }, "timestamp": "..." }] }

Приоритет — рабочий код, минимум комментариев.
```

### 5.4 Промпт: добавить Telegram бота

```
Проект AzFreight — NestJS backend.
Добавь Telegram-бота для клиентов.

Используй библиотеку telegraf (npm install telegraf).

1. Создай src/telegram/telegram.service.ts:
   - Инициализация бота через BOT_TOKEN
   - Команды: /start (привязка к клиенту), /status <номер> (статус отправки), /help
   - Отправка уведомлений: sendStatusUpdate(chatId, shipment)
2. src/telegram/telegram.controller.ts:
   - POST /api/v1/telegram/webhook — вебхук для Telegram
3. Конфиг .env: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_URL

При /start — бот спрашивает email или номер телефона, ищет клиента в БД,
сохраняет chatId в таблице Client (новое поле telegramChatId).

При смене статуса отправки — автоматически отправлять уведомление в Telegram
(если у клиента есть telegramChatId).

Приоритет — рабочий код, минимум комментариев.
```

### 5.5 Промпт: добавить Google Gemini AI

```
Проект AzFreight — NestJS backend.
Добавь AI-сервис на Google Gemini для OCR и чатбота.

1. Создай src/ai/ai.service.ts:
   - extractDocumentData(fileBuffer, mimeType) — отправляет файл (PDF/изображение)
     в Gemini, получает структурированные данные (JSON):
     { documentType, senderName, recipientName, date, items[], totalAmount, currency }
   - classifyDocument(fileBuffer) — определяет тип документа:
     invoice, cmr, bill_of_lading, awb, packing_list, certificate, other
   - chatbotReply(messages[], context) — AI-ответ клиенту на вопрос о статусе/FAQ
   - summarizeConversation(messages[]) — суммаризация переписки
2. src/ai/ai.controller.ts:
   - POST /api/v1/ai/extract — OCR + извлечение данных из загруженного документа
   - POST /api/v1/ai/classify — классификация документа
   - POST /api/v1/ai/chat — чатбот-ответ
3. Конфиг .env: GEMINI_API_KEY

SDK: @google/genai
Модель для OCR/классификации: gemini-2.5-flash
Модель для сложного анализа: gemini-2.5-pro

Пример вызова:
```js
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data: base64 } }, { text: prompt }] }],
  generationConfig: { responseMimeType: 'application/json' }
});
```

Приоритет — рабочий код, минимум комментариев.
```

### 5.6 Промпт: добавить курсы валют CBAR

```
Проект AzFreight — NestJS backend.
Добавь сервис курсов валют от ЦБ Азербайджана (CBAR).

1. Prisma-модель ExchangeRate (date, currency, rate, source)
   Уникальный индекс: @@unique([date, currency])
2. src/exchange-rates/exchange-rates.service.ts:
   - fetchDailyRates(date?: Date) — скачивает XML с https://cbar.az/currencies/{DD.MM.YYYY}.xml,
     парсит, сохраняет в БД. Формат XML:
     <ValCurs Date="16.03.2026"><ValType Type="Xarici valyutalar">
       <Valute Code="USD"><Value>1.7000</Value></Valute>
       ...
     </ValType></ValCurs>
   - getRate(currency, date?) — получить курс из БД (или fetchDailyRates если нет)
   - convertAmount(amount, fromCurrency, toCurrency, date?) — конвертация через AZN
3. src/exchange-rates/exchange-rates.controller.ts:
   - GET /api/v1/exchange-rates?date=2026-03-16 — курсы на дату
   - GET /api/v1/exchange-rates/convert?amount=1000&from=USD&to=AZN — конвертация
4. Cron: ежедневный pull в 09:00 AZT (используй @nestjs/schedule)

Для парсинга XML: npm install fast-xml-parser

Приоритет — рабочий код, минимум комментариев.
```

### 5.7 Промпт: добавить таможенный модуль

```
Проект AzFreight — NestJS + Prisma backend.
Добавь таможенный модуль (Customs Declarations).

Prisma-модель CustomsDeclaration:
- id (uuid), tenantId, shipmentId (FK → Shipment), declarationNumber,
  hsCode, status (pending/filed/inspection/cleared/rejected),
  filedAt, clearedAt, dutyAmount (Decimal), vatAmount (Decimal),
  currency (default "AZN"), notes, createdAt, updatedAt

Workflow статусов: pending → filed → inspection → cleared
                                                 → rejected

Эндпоинты:
- GET /api/v1/customs (список с пагинацией, фильтры: status, shipmentId)
- POST /api/v1/customs
- GET /api/v1/customs/:id
- PATCH /api/v1/customs/:id
- PATCH /api/v1/customs/:id/status (с валидацией допустимых переходов)
- DELETE /api/v1/customs/:id

Роли: admin, manager — полный; accountant — read-only.
Приоритет — рабочий код, минимум комментариев.
```

### 5.8 Промпт: добавить трекинг грузов

```
Проект AzFreight — NestJS backend.
Добавь модуль трекинга грузов (unified tracking).

1. Prisma-модель TrackingEvent (shipmentId, source, status, location, lat, lng, eta, details JSON)
2. src/tracking/tracking.service.ts:
   - Абстрактный интерфейс TrackingProvider { fetchStatus(externalId): TrackingEvent[] }
   - Реализации-заглушки (stubs) для:
     a) MarineTrafficProvider — морской трекинг (API: marinetraffic.com)
     b) ContainerTrackingProvider — контейнеры (API: safecube.ai)
     c) FlightTrackingProvider — авиа (API: flightaware.com)
     d) GPSTrackingProvider — автопарк (API: wialon или navixy)
   - pollShipmentTracking(shipmentId) — определяет transportType, вызывает соответствующий provider
   - getTrackingHistory(shipmentId) — события из БД
3. src/tracking/tracking.controller.ts:
   - GET /api/v1/tracking/:shipmentId — история трекинга
   - POST /api/v1/tracking/:shipmentId/poll — принудительное обновление
   - POST /api/v1/tracking/webhook — входящие webhooks от провайдеров
4. Конфиг .env: MARINE_TRAFFIC_API_KEY, FLIGHTAWARE_API_KEY, WIALON_TOKEN

Каждый provider — stub с TODO, готовый к подключению реального API.
Приоритет — рабочий код, минимум комментариев.
```

---

## 6. Порядок реализации (рекомендуемый)

```
Этап 1 (критичный):
  ├── 1.1 Загрузка файлов (S3/MinIO)          → промпт 5.2
  ├── 1.2 Страницы автопарка (frontend)         → задача 4.4
  └── 1.3 Multi-tenant seed + middleware fix

Этап 2 (бизнес-логика):
  ├── 2.1 Котировки (Quotes)                    → промпт 5.1
  ├── 2.2 Таможенный модуль                     → промпт 5.7
  ├── 2.3 Доп. расходы (Charges)                → задача 4.5
  └── 2.4 Курсы валют CBAR                      → промпт 5.6

Этап 3 (коммуникации):
  ├── 3.1 WhatsApp                              → промпт 5.3
  ├── 3.2 Telegram бот                          → промпт 5.4
  └── 3.3 Омниканальный inbox (frontend)

Этап 4 (AI + трекинг):
  ├── 4.1 Google Gemini AI                      → промпт 5.5
  └── 4.2 Трекинг грузов                        → промпт 5.8

Этап 5 (масштабирование):
  ├── 5.1 Полнотекстовый поиск (Meilisearch)
  ├── 5.2 Workflow Engine (Temporal.io)
  ├── 5.3 BI/Аналитика (Superset)
  └── 5.4 Мультиязычность (az, ru, en, tr)
```

---

## 7. Важные ограничения

При работе с Claude всегда напоминайте:

1. **Нет электронных подписей** — только загрузка подписанных оффлайн сканов
2. **Нет биллинга (Stripe/Payriff)** — оплата оффлайн, тарифы активируются вручную
3. **Нет мобильного приложения для водителей** — водители не пользователи системы
4. **Не менять контракт backend API** — новые эндпоинты добавлять, существующие не ломать
5. **AI = Google Gemini** — не OpenAI, не Anthropic
6. **Язык документации и комментариев** — русский
7. **Приоритет — рабочий код** — минимум описательных текстов и комментариев

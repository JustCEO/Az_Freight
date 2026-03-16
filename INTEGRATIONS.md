# AzFreight — Карта интеграций

Полное описание всех внешних интеграций: API, аутентификация, формат данных, стоимость, примеры кода.

---

## Общая схема

```
AzFreight Platform
│
├── 1. AI И ОБРАБОТКА ДОКУМЕНТОВ
│   ├── Google Gemini API (OCR, чатбот, классификация)
│   └── Google Document AI (специализированный OCR)
│
├── 2. КОММУНИКАЦИИ
│   ├── WhatsApp Business API (360dialog)
│   ├── Telegram Bot API
│   ├── Email (SendGrid / AWS SES)
│   └── SMS (Twilio)
│
├── 3. ТРЕКИНГ ГРУЗОВ
│   ├── MarineTraffic API (морские перевозки)
│   ├── SafeCube / JSONCargo (контейнеры)
│   ├── Wialon / Navixy (GPS автопарка)
│   └── FlightAware / AviationStack (авиа)
│
├── 4. ФИНАНСЫ
│   └── CBAR API (курсы валют ЦБ Азербайджана)
│
├── 5. ТАМОЖНЯ
│   └── ASYCUDA / E-Customs (ГТК Азербайджана)
│
├── 6. КАРТЫ
│   ├── Mapbox (визуализация маршрутов)
│   └── Google Maps Platform (geocoding, distance)
│
└── 7. ХРАНЕНИЕ ФАЙЛОВ
    └── AWS S3 / MinIO
```

---

## 1. Google Gemini API

### Назначение
OCR документов, AI-чатбот для клиентов, классификация документов, извлечение структурированных данных из CMR/AWB/инвойсов.

### Параметры

| Параметр | Значение |
|----------|----------|
| Провайдер | Google (ai.google.dev) |
| Модели | Gemini 2.5 Flash (быстрый), Gemini 2.5 Pro (точный) |
| SDK | `@google/genai` (Node.js), `google-genai` (Python) |
| Ввод | Текст, изображения (JPEG/PNG), PDF (до 1000 страниц) |
| Вывод | Текст, структурированный JSON (forced JSON mode) |
| Rate Limits | 1500 RPM (Flash), 150 RPM (Pro) |
| Стоимость | Flash: ~$0.15/1M input tokens, ~$0.60/1M output |

### Установка

```bash
npm install @google/genai
```

### .env

```
GEMINI_API_KEY=AIzaSy...
```

### Примеры кода

#### OCR + извлечение данных из документа

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function extractDocumentData(fileBuffer: Buffer, mimeType: string) {
  const base64 = fileBuffer.toString('base64');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: base64 } },
        { text: `Извлеки данные из этого документа и верни JSON:
          {
            "documentType": "invoice | cmr | bill_of_lading | awb | packing_list | certificate",
            "number": "номер документа",
            "date": "YYYY-MM-DD",
            "sender": { "name": "", "address": "" },
            "recipient": { "name": "", "address": "" },
            "items": [{ "description": "", "quantity": 0, "weight": 0 }],
            "totalAmount": 0,
            "currency": "USD",
            "notes": ""
          }` },
      ],
    }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  return JSON.parse(response.text);
}
```

#### Классификация документа

```typescript
async function classifyDocument(fileBuffer: Buffer, mimeType: string) {
  const base64 = fileBuffer.toString('base64');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: base64 } },
        { text: 'Определи тип этого документа. Верни JSON: { "type": "invoice | cmr | bill_of_lading | awb | packing_list | certificate | customs_declaration | other", "confidence": 0.95 }' },
      ],
    }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  return JSON.parse(response.text);
}
```

#### AI-чатбот для клиентов

```typescript
async function chatbotReply(
  userMessage: string,
  context: { shipments: any[]; clientName: string },
) {
  const systemPrompt = `Ты — AI-ассистент логистической компании AzFreight.
Отвечай на вопросы клиентов о статусе отправок, сроках доставки, документах.
Если не знаешь ответ — предложи связаться с менеджером.
Контекст клиента: ${JSON.stringify(context)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'user', parts: [{ text: userMessage }] },
    ],
  });

  return response.text;
}
```

### Что можно делать с Gemini в логистике

- Обработка PDF до 1000 страниц с пониманием таблиц и диаграмм
- Извлечение данных из CMR, коносаментов, AWB → JSON
- Мультиязычное распознавание (az, ru, en, tr, zh)
- Автоматическое заполнение полей отправки из загруженного документа
- Суммаризация переписок с клиентами

---

## 2. Google Document AI

### Назначение
Специализированный OCR для сложных таблиц, форм и инвойсов (когда Gemini не справляется).

### Параметры

| Параметр | Значение |
|----------|----------|
| Провайдер | Google Cloud (cloud.google.com/document-ai) |
| Layout Parser | Заголовки, таблицы, списки, графики |
| Invoice Parser | Номер, сумма, дата, позиции — автоматически |
| Custom Processor | Обучение на CMR, AWB и других специфических формах |
| Стоимость | ~$1.50/1000 страниц |

### Установка

```bash
npm install @google-cloud/documentai
```

### Пример

```typescript
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

const client = new DocumentProcessorServiceClient();

async function processWithDocumentAI(fileBuffer: Buffer, mimeType: string) {
  const projectId = process.env.GCP_PROJECT_ID;
  const location = 'eu'; // или 'us'
  const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;

  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

  const [result] = await client.processDocument({
    name,
    rawDocument: {
      content: fileBuffer.toString('base64'),
      mimeType,
    },
  });

  return result.document;
}
```

---

## 3. WhatsApp Business API (360dialog)

### Назначение
Двусторонние сообщения с клиентами: уведомления о статусах, приём входящих, отправка документов.

### Параметры

| Параметр | Значение |
|----------|----------|
| Провайдер | 360dialog (Meta Business Partner) |
| API URL | `https://waba.360dialog.io/v1/messages` |
| Аутентификация | `D360-API-KEY` header |
| Типы сообщений | Text, Template, Media (image, document, video) |
| Webhook | POST на ваш endpoint при входящих |
| Шаблоны | Требуют одобрения Meta (1-2 дня) |
| Стоимость | ~$0.05-0.08 за conversation |

### Настройка

1. Зарегистрироваться на [360dialog.com](https://www.360dialog.com/)
2. Получить API Key
3. Настроить Webhook URL: `https://api.azfreight.az/api/v1/messaging/whatsapp/webhook`
4. Создать шаблоны сообщений в 360dialog Dashboard

### .env

```
WHATSAPP_API_URL=https://waba.360dialog.io/v1
WHATSAPP_API_KEY=your-360dialog-api-key
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token
```

### Примеры кода

#### Отправка template-сообщения (уведомление о статусе)

```typescript
import axios from 'axios';

const whatsappApi = axios.create({
  baseURL: process.env.WHATSAPP_API_URL,
  headers: { 'D360-API-KEY': process.env.WHATSAPP_API_KEY },
});

// Шаблон должен быть предварительно одобрен Meta
async function sendStatusUpdate(phone: string, shipmentRef: string, status: string) {
  await whatsappApi.post('/messages', {
    to: phone, // формат: 994XXXXXXXXX (без +)
    type: 'template',
    template: {
      name: 'shipment_status_update', // имя шаблона в 360dialog
      language: { code: 'ru' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: shipmentRef },
            { type: 'text', text: status },
          ],
        },
      ],
    },
  });
}
```

#### Отправка текстового сообщения

```typescript
async function sendTextMessage(phone: string, text: string) {
  await whatsappApi.post('/messages', {
    to: phone,
    type: 'text',
    text: { body: text },
  });
}
```

#### Отправка документа

```typescript
async function sendDocument(phone: string, documentUrl: string, filename: string) {
  await whatsappApi.post('/messages', {
    to: phone,
    type: 'document',
    document: {
      link: documentUrl, // публичный URL файла
      filename: filename,
    },
  });
}
```

#### Обработка входящего webhook

```typescript
// POST /api/v1/messaging/whatsapp/webhook
function handleWebhook(body: any) {
  if (body.messages) {
    for (const msg of body.messages) {
      const from = msg.from;         // 994XXXXXXXXX
      const text = msg.text?.body;   // текст сообщения
      const timestamp = msg.timestamp;

      // Найти клиента по номеру телефона
      // Сохранить в таблицу Message
      // Если есть AI — передать в Gemini для автоответа
      // Иначе — создать задачу для менеджера
    }
  }

  if (body.statuses) {
    for (const status of body.statuses) {
      // Обновить статус доставки: sent → delivered → read
    }
  }
}
```

### Рекомендуемые шаблоны сообщений

| Шаблон | Назначение | Пример текста |
|--------|------------|---------------|
| `shipment_status_update` | Смена статуса | Отправка {{1}} — новый статус: {{2}} |
| `shipment_delivered` | Доставлено | Ваш груз {{1}} доставлен. Благодарим за выбор AzFreight. |
| `invoice_reminder` | Напоминание об оплате | Счёт №{{1}} на сумму {{2}} — срок оплаты {{3}} |
| `quote_sent` | Котировка | Подготовлена котировка {{1}} на маршрут {{2}}. Проверьте в личном кабинете. |
| `document_request` | Запрос документа | Для отправки {{1}} требуется документ: {{2}}. Отправьте фото или файл в этот чат. |

---

## 4. Telegram Bot API

### Назначение
Бот для клиентов (проверка статуса, FAQ) + push-уведомления менеджерам.

### Параметры

| Параметр | Значение |
|----------|----------|
| Провайдер | Telegram (core.telegram.org/bots/api) |
| API URL | `https://api.telegram.org/bot{token}/` |
| Аутентификация | Bot Token (через @BotFather) |
| Webhook | POST на ваш endpoint |
| Стоимость | Бесплатно |

### Настройка

1. Создать бота через [@BotFather](https://t.me/BotFather) в Telegram
2. Получить Bot Token
3. Установить webhook: `POST https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://api.azfreight.az/api/v1/telegram/webhook`

### .env

```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://api.azfreight.az/api/v1/telegram/webhook
```

### Установка

```bash
npm install telegraf
```

### Пример кода

```typescript
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Команда /start — привязка клиента
bot.start(async (ctx) => {
  await ctx.reply(
    'Добро пожаловать в AzFreight!\n' +
    'Отправьте ваш email для привязки аккаунта:',
  );
});

// Команда /status — проверка статуса отправки
bot.command('status', async (ctx) => {
  const ref = ctx.message.text.split(' ')[1];
  if (!ref) {
    return ctx.reply('Использование: /status SHP-2026-0001');
  }

  // Найти отправку по referenceNumber и tenantId клиента
  const shipment = await findShipmentByRef(ref, ctx.from.id);

  if (!shipment) {
    return ctx.reply('Отправка не найдена.');
  }

  await ctx.reply(
    `📦 ${shipment.referenceNumber}\n` +
    `Маршрут: ${shipment.origin} → ${shipment.destination}\n` +
    `Статус: ${shipment.status}\n` +
    `Тип: ${shipment.transportType}`,
  );
});

// Команда /help
bot.help((ctx) => {
  ctx.reply(
    'Доступные команды:\n' +
    '/status <номер> — статус отправки\n' +
    '/shipments — мои активные отправки\n' +
    '/help — справка',
  );
});

// Отправка уведомления клиенту
async function sendTelegramNotification(chatId: number, message: string) {
  await bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
}

// Уведомление при смене статуса
async function notifyStatusChange(chatId: number, shipment: any, newStatus: string) {
  const statusEmoji = {
    pending: '⏳', confirmed: '✅', in_transit: '🚚',
    customs: '🏛️', delivered: '📦', completed: '✔️', cancelled: '❌',
  };

  await bot.telegram.sendMessage(chatId,
    `${statusEmoji[newStatus] || '📋'} Отправка <b>${shipment.referenceNumber}</b>\n` +
    `Новый статус: <b>${newStatus}</b>\n` +
    `${shipment.origin} → ${shipment.destination}`,
    { parse_mode: 'HTML' },
  );
}
```

---

## 5. Email (SendGrid / AWS SES)

### Назначение
Транзакционные письма (уведомления, сброс пароля), отправка PDF-инвойсов и котировок.

### .env (SendGrid)

```
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@azfreight.az
SENDGRID_FROM_NAME=AzFreight
```

### .env (AWS SES)

```
AWS_SES_REGION=eu-west-1
AWS_SES_ACCESS_KEY=AKIA...
AWS_SES_SECRET_KEY=...
SES_FROM_EMAIL=noreply@azfreight.az
```

### Установка

```bash
# SendGrid
npm install @sendgrid/mail

# или AWS SES
npm install @aws-sdk/client-ses
```

### Пример (SendGrid)

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendStatusEmail(to: string, shipmentRef: string, status: string) {
  await sgMail.send({
    to,
    from: { email: process.env.SENDGRID_FROM_EMAIL, name: 'AzFreight' },
    subject: `Отправка ${shipmentRef} — ${status}`,
    html: `
      <h2>Обновление статуса отправки</h2>
      <p>Отправка <strong>${shipmentRef}</strong> изменила статус на <strong>${status}</strong>.</p>
      <p><a href="https://portal.azfreight.az/shipments">Открыть в личном кабинете</a></p>
    `,
  });
}

// Отправка PDF-инвойса
async function sendInvoiceEmail(to: string, invoiceNumber: string, pdfBuffer: Buffer) {
  await sgMail.send({
    to,
    from: { email: process.env.SENDGRID_FROM_EMAIL, name: 'AzFreight' },
    subject: `Счёт №${invoiceNumber}`,
    html: `<p>Во вложении счёт №${invoiceNumber}. Просим оплатить в установленный срок.</p>`,
    attachments: [{
      content: pdfBuffer.toString('base64'),
      filename: `invoice-${invoiceNumber}.pdf`,
      type: 'application/pdf',
      disposition: 'attachment',
    }],
  });
}
```

---

## 6. SMS (Twilio)

### Назначение
SMS-уведомления (fallback если WhatsApp недоступен) + OTP для верификации телефона.

### .env

```
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### Установка

```bash
npm install twilio
```

### Пример

```typescript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(to: string, body: string) {
  await client.messages.create({
    to,    // +994XXXXXXXXX
    from: process.env.TWILIO_PHONE_NUMBER,
    body,
  });
}
```

---

## 7. MarineTraffic API (морской трекинг)

### Назначение
Позиция судна в реальном времени, ETA, история заходов в порты, загруженность терминалов.

### Параметры

| Параметр | Значение |
|----------|----------|
| Провайдер | MarineTraffic (marinetraffic.com) |
| Данные | AIS: позиция, скорость, курс, ETA, порт назначения |
| Поиск | По IMO, MMSI, vessel name, UNLOCODE |
| Rate Limit | 500 req/min |
| Стоимость | От $100/мес |

### .env

```
MARINE_TRAFFIC_API_KEY=your-key
```

### Пример

```typescript
import axios from 'axios';

async function getVesselPosition(imo: string) {
  const response = await axios.get('https://services.marinetraffic.com/api/exportvessel/v:5', {
    params: {
      v: 5,
      apikey: process.env.MARINE_TRAFFIC_API_KEY,
      imo,
      protocol: 'json',
    },
  });

  const vessel = response.data[0];
  return {
    lat: vessel.LAT,
    lng: vessel.LON,
    speed: vessel.SPEED,
    status: vessel.STATUS,
    destination: vessel.DESTINATION,
    eta: vessel.ETA,
    lastUpdate: vessel.TIMESTAMP,
  };
}
```

---

## 8. Container Tracking (SafeCube / JSONCargo)

### Назначение
Статус контейнера в реальном времени, покрытие 180+ морских линий.

### Параметры

| Параметр | Значение |
|----------|----------|
| Провайдер | SafeCube (safecube.ai) или JSONCargo |
| Поиск | Container number, booking number, Bill of Lading |
| Покрытие | 180+ морских линий (Maersk, MSC, CMA CGM...) |
| Webhooks | Уведомления при задержках, смене статуса |

### Пример (SafeCube)

```typescript
async function trackContainer(containerNumber: string) {
  const response = await axios.get(`https://api.safecube.ai/v1/containers/${containerNumber}`, {
    headers: { Authorization: `Bearer ${process.env.SAFECUBE_API_KEY}` },
  });

  return {
    status: response.data.status,
    events: response.data.events, // погрузка, выгрузка, таможня
    eta: response.data.eta,
    vessel: response.data.vessel,
    route: response.data.route,
  };
}
```

---

## 9. GPS Tracking (Wialon / Navixy)

### Назначение
Трекинг собственного автопарка: координаты, скорость, геозоны, расход топлива.

### Параметры

| Параметр | Значение |
|----------|----------|
| Провайдер | Wialon (gurtam.com) или Navixy (navixy.com) |
| Протокол | REST API + WebSocket (real-time) |
| Данные | Координаты, скорость, направление, пробег, топливо |
| Geofencing | Виртуальные зоны (склады, терминалы, таможня) |
| Совместимость | 2500+ моделей GPS-трекеров |

### .env

```
WIALON_TOKEN=your-token
WIALON_API_URL=https://hst-api.wialon.com/wialon/ajax.html
```

### Пример (Wialon)

```typescript
async function getVehiclePosition(vehicleId: string) {
  const response = await axios.get(process.env.WIALON_API_URL, {
    params: {
      svc: 'core/search_item',
      params: JSON.stringify({
        id: vehicleId,
        flags: 1025, // базовые данные + позиция
      }),
      sid: process.env.WIALON_TOKEN,
    },
  });

  const item = response.data.item;
  return {
    lat: item.pos?.y,
    lng: item.pos?.x,
    speed: item.pos?.s,
    lastUpdate: new Date(item.pos?.t * 1000),
  };
}
```

---

## 10. Flight Tracking (FlightAware / AviationStack)

### Назначение
Статус авиарейса, ETA, задержки/отмены.

### .env

```
FLIGHTAWARE_API_KEY=your-key
# или
AVIATIONSTACK_API_KEY=your-key
```

### Пример (AviationStack)

```typescript
async function getFlightStatus(flightNumber: string) {
  const response = await axios.get('http://api.aviationstack.com/v1/flights', {
    params: {
      access_key: process.env.AVIATIONSTACK_API_KEY,
      flight_iata: flightNumber,
    },
  });

  const flight = response.data.data[0];
  return {
    status: flight.flight_status,
    departure: flight.departure,
    arrival: flight.arrival,
    airline: flight.airline.name,
  };
}
```

---

## 11. CBAR API (курсы валют)

### Назначение
Официальные курсы AZN к 30+ валютам от ЦБ Азербайджана. Бесплатно.

### URL

```
https://cbar.az/currencies/{DD.MM.YYYY}.xml
```

### Пример

```typescript
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({ ignoreAttributes: false });

async function fetchCBARRates(date: Date): Promise<Record<string, number>> {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  const url = `https://cbar.az/currencies/${dd}.${mm}.${yyyy}.xml`;
  const { data } = await axios.get(url);
  const parsed = parser.parse(data);

  const rates: Record<string, number> = {};
  const valTypes = parsed.ValCurs.ValType;

  for (const valType of Array.isArray(valTypes) ? valTypes : [valTypes]) {
    const valutes = valType.Valute;
    for (const v of Array.isArray(valutes) ? valutes : [valutes]) {
      rates[v['@_Code']] = parseFloat(v.Value);
    }
  }

  return rates; // { USD: 1.7000, EUR: 1.8400, ... }
}

// Конвертация через AZN
function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  if (from === 'AZN') return amount / rates[to];
  if (to === 'AZN') return amount * rates[from];
  return (amount * rates[from]) / rates[to];
}
```

---

## 12. ASYCUDA / E-Customs (ГТК Азербайджана)

### Назначение
Автоматическое получение статуса таможенной декларации, справочник HS-кодов.

### Ограничения

- Требует официального согласования с Государственным Таможенным Комитетом
- Формат: XML/SOAP (ASYCUDAWorld 4.4)
- API может быть недоступен — предусмотреть ручной ввод как fallback

### Рекомендации

1. На первом этапе — ручной ввод данных деклараций
2. Встроить справочник HS-кодов (скачать открытый dataset)
3. При получении API-доступа от ГТК — добавить автоматический pull статусов

---

## 13. Mapbox / Google Maps

### Назначение
Визуализация маршрутов на карте, карта автопарка, geocoding адресов, автокомплит.

### .env

```
# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxx

# или Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...
```

### Установка (Mapbox)

```bash
npm install mapbox-gl react-map-gl
```

### Пример (React + Mapbox)

```tsx
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

function ShipmentMap({ latitude, longitude, label }: Props) {
  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ latitude, longitude, zoom: 6 }}
      style={{ width: '100%', height: 400 }}
      mapStyle="mapbox://styles/mapbox/light-v11"
    >
      <Marker latitude={latitude} longitude={longitude}>
        <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm">{label}</div>
      </Marker>
    </Map>
  );
}
```

---

## 14. AWS S3 / MinIO (хранение файлов)

### Назначение
Хранение документов (сканы, PDF, фото) с версионированием и контролем доступа.

### .env

```
S3_ENDPOINT=http://localhost:9000     # MinIO для разработки
S3_BUCKET=azfreight-docs
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_REGION=us-east-1
```

### Установка

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Пример

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true, // для MinIO
});

async function uploadFile(buffer: Buffer, key: string, mimeType: string) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));
}

async function getDownloadUrl(key: string, ttlSeconds = 900): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  }), { expiresIn: ttlSeconds });
}
```

---

## Сводная таблица

| Интеграция | Назначение | Стоимость | Приоритет |
|------------|------------|-----------|-----------|
| Google Gemini | AI: OCR, чатбот, классификация | ~$0.15/1M tokens | 🟡 Средний |
| Google Document AI | OCR для сложных форм | ~$1.50/1K страниц | 🟢 Низкий |
| WhatsApp (360dialog) | Уведомления + чат с клиентами | ~$0.05/conversation | 🟡 Средний |
| Telegram Bot | Бот + push уведомления | Бесплатно | 🟡 Средний |
| SendGrid / AWS SES | Email уведомления | ~$0.10/1K emails | 🔴 Высокий |
| Twilio | SMS (fallback) | ~$0.05/SMS | 🟢 Низкий |
| MarineTraffic | Трекинг судов | От $100/мес | 🟡 Средний |
| SafeCube | Трекинг контейнеров | По подписке | 🟡 Средний |
| FlightAware | Трекинг авиагрузов | От $50/мес | 🟢 Низкий |
| Wialon / Navixy | GPS автопарка | По подписке | 🟡 Средний |
| CBAR API | Курсы валют AZN | Бесплатно | 🔴 Высокий |
| ASYCUDA | Таможня | Согласование с ГТК | 🟢 Низкий |
| Mapbox / Google Maps | Карты и маршруты | Free tier | 🟡 Средний |
| AWS S3 / MinIO | Хранение файлов | ~$0.023/GB/мес | 🔴 Высокий |

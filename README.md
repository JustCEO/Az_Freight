# AzFreight — B2B SaaS платформа для международных экспедиторов

Единая платформа управления международными грузоперевозками (авто TIR, море, авиа, ЖД), заменяющая Excel, WhatsApp и разрозненные папки с документами.

## Стек технологий

| Слой | Технология |
|------|------------|
| Backend | NestJS + TypeScript + Prisma ORM |
| Frontend | Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS |
| БД | PostgreSQL 16 |
| Контейнеризация | Docker + Docker Compose |

## Структура репозитория

```
azfreight/
├── backend/                  # NestJS API (порт 3000)
│   ├── prisma/
│   │   └── schema.prisma     # Схема БД
│   ├── src/
│   │   ├── auth/             # JWT аутентификация + refresh tokens
│   │   ├── shipments/        # Отправки (CRUD + workflow статусов)
│   │   ├── clients/          # Клиенты CRM
│   │   ├── carriers/         # Перевозчики
│   │   ├── invoices/         # Счета
│   │   ├── documents/        # Документы (метаданные, без э-подписей)
│   │   ├── vehicles/         # Автопарк
│   │   ├── tenants/          # Мультитенантность
│   │   ├── users/            # Управление пользователями
│   │   ├── prisma/           # PrismaService
│   │   ├── common/           # Guards, decorators, middleware
│   │   └── config/           # Конфигурация
│   ├── test/                 # E2E тесты
│   ├── docker-compose.yml    # PostgreSQL
│   └── .env.example
│
├── frontend/                 # Next.js SPA (порт 3001)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/       # /login, /register
│   │   │   ├── (dashboard)/  # Оператор: dashboard, shipments, clients, carriers, invoices
│   │   │   └── (portal)/     # Клиентский портал (read-only)
│   │   ├── components/       # DataTable, Sidebar, StatusBadge, Pagination
│   │   ├── context/          # AuthContext (JWT + роли)
│   │   ├── lib/
│   │   │   ├── api-client.ts # Axios + auto-refresh JWT при 401
│   │   │   └── api/          # Модульные API-функции
│   │   └── types/            # TypeScript типы
│   └── .env.local.example
│
├── CLAUDE_GUIDE.md           # Гайд для доработки через Claude
├── INTEGRATIONS.md           # Все запланированные интеграции
└── README.md                 # Этот файл
```

## Быстрый старт

### Предварительные требования

- Node.js 18+ (рекомендуется 20 LTS)
- npm 9+
- Docker и Docker Compose
- Git

### 1. Клонирование репозитория

```bash
git clone https://github.com/<your-org>/azfreight.git
cd azfreight
```

### 2. Запуск базы данных

```bash
cd backend
docker compose up -d
```

PostgreSQL будет доступен на `localhost:5432`:
- User: `azfreight`
- Password: `azfreight_secret`
- DB: `azfreight`

### 3. Настройка и запуск Backend

```bash
cd backend

# Установка зависимостей
npm install

# Создание .env
cp .env.example .env
```

Содержимое `.env`:
```env
DATABASE_URL="postgresql://azfreight:azfreight_secret@localhost:5432/azfreight?schema=public"
JWT_SECRET="сгенерируйте-случайную-строку-минимум-32-символа"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
PORT=3000
```

```bash
# Применение миграций и генерация Prisma Client
npx prisma migrate dev --name init
npx prisma generate

# Запуск в режиме разработки
npm run start:dev
```

Backend доступен: `http://localhost:3000`

### 4. Настройка и запуск Frontend

```bash
cd frontend

# Установка зависимостей
npm install

# Создание .env.local
cp .env.local.example .env.local
```

Содержимое `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

```bash
# Запуск в режиме разработки
npm run dev
```

Frontend доступен: `http://localhost:3001`

### 5. Проверка работоспособности

1. Откройте `http://localhost:3001/register` — зарегистрируйте первого пользователя
2. Войдите на `http://localhost:3001/login`
3. Перейдите в Dashboard

## API-эндпоинты (Backend)

| Группа | Метод | Путь | Описание |
|--------|-------|------|----------|
| **Auth** | POST | `/api/v1/auth/register` | Регистрация |
| | POST | `/api/v1/auth/login` | Вход |
| | POST | `/api/v1/auth/refresh` | Обновление JWT |
| | GET | `/api/v1/auth/me` | Текущий пользователь |
| | POST | `/api/v1/auth/logout` | Выход |
| **Shipments** | GET | `/api/v1/shipments` | Список (с пагинацией) |
| | POST | `/api/v1/shipments` | Создать |
| | GET | `/api/v1/shipments/:id` | Получить |
| | PATCH | `/api/v1/shipments/:id` | Обновить |
| | DELETE | `/api/v1/shipments/:id` | Удалить |
| | PATCH | `/api/v1/shipments/:id/status` | Сменить статус |
| | GET | `/api/v1/shipments/:id/timeline` | Timeline |
| **Clients** | GET/POST | `/api/v1/clients` | Список / Создать |
| | GET/PATCH/DELETE | `/api/v1/clients/:id` | CRUD |
| **Carriers** | GET/POST | `/api/v1/carriers` | Список / Создать |
| | GET/PATCH/DELETE | `/api/v1/carriers/:id` | CRUD |
| **Invoices** | GET/POST | `/api/v1/invoices` | Список / Создать |
| | GET/PATCH/DELETE | `/api/v1/invoices/:id` | CRUD |
| **Documents** | GET/POST | `/api/v1/documents` | Метаданные |
| | GET/PATCH/DELETE | `/api/v1/documents/:id` | CRUD |
| **Vehicles** | GET/POST | `/api/v1/vehicles` | Список / Создать |
| | GET/PATCH/DELETE | `/api/v1/vehicles/:id` | CRUD |

## Роли и доступ

| Роль | Описание | Доступ |
|------|----------|--------|
| `admin` | Администратор | Полный доступ ко всем модулям + управление пользователями |
| `manager` | Менеджер-экспедитор | Отправки, клиенты, перевозчики, документы, счета |
| `accountant` | Бухгалтер | Счета, финансовые отчёты (read-only для остального) |
| `client` | Клиент (портал) | Только `/portal/*` — свои отправки и документы (read-only) |

## Workflow статусов отправки

```
draft → pending → confirmed → in_transit → customs → delivered → completed
                                                                      ↓
                                                              (любой) → cancelled
```

Смена статуса через `PATCH /api/v1/shipments/:id/status` с валидацией допустимых переходов.

## Команды разработки

### Backend

```bash
npm run start:dev       # Запуск (watch mode)
npm run build           # Сборка
npm run start:prod      # Продакшен
npm run test            # Unit тесты
npm run test:e2e        # E2E тесты
npx prisma studio       # GUI для БД
npx prisma migrate dev  # Создать миграцию
```

### Frontend

```bash
npm run dev             # Запуск (watch mode, порт 3001)
npm run build           # Продакшен сборка
npm run start           # Продакшен сервер
npm run lint            # Линтер
```

## Продакшен-деплой

### Docker (рекомендуется)

```bash
# Backend
cd backend
docker build -t azfreight-backend .
docker run -p 3000:3000 --env-file .env azfreight-backend

# Frontend
cd frontend
docker build -t azfreight-frontend .
docker run -p 3001:3000 azfreight-frontend
```

### Переменные окружения для продакшена

| Переменная | Описание | Обязательна |
|------------|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string | Да |
| `JWT_SECRET` | Секрет для подписи JWT (мин. 32 символа) | Да |
| `JWT_ACCESS_EXPIRATION` | Время жизни access token (напр. `15m`) | Да |
| `JWT_REFRESH_EXPIRATION` | Время жизни refresh token (напр. `7d`) | Да |
| `PORT` | Порт backend (по умолчанию `3000`) | Нет |
| `NEXT_PUBLIC_API_URL` | URL backend API для frontend | Да |

## Ключевые ограничения текущей версии

- **Нет электронных подписей** — документы подписываются оффлайн, в систему загружаются сканы
- **Нет встроенного биллинга** — оплата подписки оффлайн, тарифы активируются вручную
- **Нет мобильного приложения для водителей** — статусы обновляются менеджерами
- **Нет загрузки файлов** — модуль `documents` хранит только метаданные (S3 интеграция — следующий этап)

## Следующие шаги

Подробный план доработки и интеграций смотрите в:
- **[CLAUDE_GUIDE.md](./CLAUDE_GUIDE.md)** — пошаговый гайд для доработки через Claude
- **[INTEGRATIONS.md](./INTEGRATIONS.md)** — все запланированные интеграции (WhatsApp, Gemini AI, трекинг и др.)

## Лицензия

Proprietary. Все права защищены.

# AzFreight — VPS Docker Deployment

## Architecture

```
GitHub Actions (on push to main)
  └─ Build Docker images → ghcr.io
  └─ SSH into VPS → docker compose pull + up

VPS (/opt/azfreight/)
  ├─ docker-compose.yml  (copy from repo root)
  ├─ .env                (secrets — not in repo)
  ├─ postgres (container, volume: postgres_data)
  ├─ backend  (container, port 3001 → 3000)
  └─ frontend (container, port 3000 → 3000)
```

## Required GitHub Secrets

Set these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | VPS IP address or hostname |
| `VPS_USER` | SSH username (e.g. `root` or `deploy`) |
| `VPS_SSH_KEY` | Private SSH key (ed25519 or RSA) |
| `VPS_PORT` | SSH port (default: `22`) |

`GITHUB_TOKEN` is provided automatically — no setup needed.

## VPS Setup (one-time)

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Create project directory
mkdir -p /opt/azfreight
cd /opt/azfreight

# 3. Copy docker-compose.yml from repo root
# (or curl it from GitHub)

# 4. Create .env with your configuration
cat > .env << 'EOF'
# Postgres
POSTGRES_USER=azfreight
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=azfreight
DATABASE_URL=postgresql://azfreight:<strong-password>@postgres:5432/azfreight

# Backend
JWT_SECRET=<random-64-char-string>
PORT=3000
FRONTEND_URL=https://your-domain.com

# OVH Object Storage (S3-compatible)
S3_ENDPOINT=https://s3.gra.io.cloud.ovh.net
S3_REGION=gra
S3_BUCKET=azfreight-files
S3_ACCESS_KEY=<your-access-key>
S3_SECRET_KEY=<your-secret-key>

# Frontend
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
EOF

# 5. Login to GitHub Container Registry
echo <GITHUB_PAT> | docker login ghcr.io -u <github-username> --password-stdin

# 6. Start everything
docker compose pull
docker compose up -d
```

## How Deploys Work

1. Push to `main` triggers GitHub Actions
2. Actions builds backend + frontend Docker images
3. Images pushed to `ghcr.io/justceo/az_freight-backend:latest` and `ghcr.io/justceo/az_freight-frontend:latest`
4. Actions SSHs into VPS and runs `docker compose pull && up`
5. Backend container runs `prisma db push --accept-data-loss` on startup before serving

## Data Persistence

- **Postgres data** persists in the `postgres_data` Docker volume across deploys
- **File uploads** are stored in OVH Object Storage (S3), not on local disk
- Container restarts do not affect data

## Rollback

```bash
# On the VPS, pull a specific commit's image:
docker compose pull
docker compose up -d --no-deps backend frontend

# Or pin to a specific SHA in docker-compose.yml:
# image: ghcr.io/justceo/az_freight-backend:sha-abc1234
```

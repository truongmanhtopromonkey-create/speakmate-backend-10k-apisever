# SpeakFlow Backend 10k Starter

Production-oriented backend source for SpeakFlow, split into:

- `api-server/`: public HTTP API for the iOS app
- `worker/`: background AI worker consuming Redis queues
- `shared/`: shared schemas, constants, and helpers

## Stack

- Node.js 20+
- Express
- BullMQ + Redis
- Postgres
- OpenAI Node SDK
- Cloudflare R2 or S3-compatible object storage

## Main routes

- `GET /health`
- `GET /api/config`
- `POST /api/review-speaking`
- `POST /api/conversation/reply`
- `POST /api/conversation/pronunciation`
- `POST /api/tts`

## Architecture

App -> API Server -> Redis Queue -> AI Worker -> OpenAI

Side services:
- Postgres for users, usage, sessions
- Redis for queue, rate limiting, hot cache
- S3/R2 for audio files

## Quick start

### 1) Start dependencies locally

Use your own Postgres and Redis, or Docker services.

### 2) Install packages

```bash
cd api-server && npm install
cd ../worker && npm install
```

### 3) Configure env

Copy `.env.example` to `.env` in both `api-server/` and `worker/` and fill values.

### 4) Run database schema

Run the SQL inside `api-server/src/db/schema.sql` on your Postgres instance.

### 5) Start API and worker

```bash
cd api-server && npm run dev
cd ../worker && npm run dev
```

## Deploy

Deploy `api-server` and `worker` as separate services.

Recommended managed services:
- Railway / Render / Fly for API and worker
- Upstash Redis or Railway Redis
- Supabase / Neon / Railway Postgres
- Cloudflare R2 for audio files

## Notes

- Premium is not truly unlimited; use soft limits.
- Review and conversation routes support graceful fallback.
- TTS can cache by text hash in object storage.
- Conversation routes are designed for multi-turn state stored in Postgres.

## Railway deployment files included

This bundle now includes:

- `api-server/Dockerfile`
- `worker/Dockerfile`
- `railway.api.json`
- `railway.worker.json`
- `DEPLOY_RAILWAY.md`

Recommended Railway deployment:
- service 1: API (`api-server/`)
- service 2: Worker (`worker/`)
- service 3: Redis
- service 4: Postgres

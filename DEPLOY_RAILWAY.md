# Deploy SpeakFlow 10k Backend on Railway

This repo is designed to run as **two separate Railway services**:

1. **API Server** → public HTTP API for the iOS app
2. **AI Worker** → background worker for BullMQ jobs

It also needs:
- **Redis**
- **Postgres**

---

## Recommended Railway setup

Create these Railway services:

- `speakflow-api`
- `speakflow-worker`
- `redis`
- `postgres`

---

## Folder structure

- `api-server/` → deploy as API service
- `worker/` → deploy as Worker service
- `railway.api.json` → example Railway config for API service
- `railway.worker.json` → example Railway config for Worker service

---

## Deploy API service

### Source Root
Set Railway **Root Directory** to:

```text
api-server
```

### Build
Railway can use the included `Dockerfile`, or you can use native Node build.

If using Dockerfile:
- keep `api-server/Dockerfile`

If using Node native build instead:
- Build command:

```bash
npm ci
```

- Start command:

```bash
npm start
```

### Variables for API service

```env
NODE_ENV=production
PORT=8080
LOG_LEVEL=info
API_BASE_URL=https://YOUR_API_DOMAIN
REDIS_URL=${{Redis.REDIS_URL}}
DATABASE_URL=${{Postgres.DATABASE_URL}}
OPENAI_API_KEY=sk-...
OPENAI_MODEL_TEXT=gpt-5.4-mini
OPENAI_MODEL_TTS=gpt-4o-mini-tts
OPENAI_MODEL_STT=gpt-4o-mini-transcribe
FREE_DAILY_LIMIT=3
PREMIUM_DAILY_SOFT_LIMIT=50
FREE_CONVERSATION_TURNS_DAILY=10
PREMIUM_CONVERSATION_TURNS_DAILY=150
ENABLE_FALLBACK=true
ALLOW_ORIGINS=*
S3_ENDPOINT=
S3_REGION=auto
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=
S3_PUBLIC_BASE_URL=
```

---

## Deploy Worker service

### Source Root
Set Railway **Root Directory** to:

```text
worker
```

### Build
If using Dockerfile:
- keep `worker/Dockerfile`

If using Node native build instead:
- Build command:

```bash
npm ci
```

- Start command:

```bash
npm start
```

### Variables for Worker service

```env
NODE_ENV=production
LOG_LEVEL=info
REDIS_URL=${{Redis.REDIS_URL}}
DATABASE_URL=${{Postgres.DATABASE_URL}}
OPENAI_API_KEY=sk-...
OPENAI_MODEL_TEXT=gpt-5.4-mini
OPENAI_MODEL_TTS=gpt-4o-mini-tts
OPENAI_MODEL_STT=gpt-4o-mini-transcribe
ENABLE_FALLBACK=true
S3_ENDPOINT=
S3_REGION=auto
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=
S3_PUBLIC_BASE_URL=
```

---

## Database setup

Run this SQL in your Postgres database:

```text
api-server/src/db/schema.sql
```

You can paste it into Railway Postgres SQL console or any Postgres client.

---

## Health check

After deploy, open:

```text
https://YOUR_API_DOMAIN/health
```

Expected result:

```json
{"status":"ok"}
```

Also test:

```text
https://YOUR_API_DOMAIN/api/config
```

---

## iOS app endpoints

Point the app to your Railway API domain for:

- `/api/review-speaking`
- `/api/conversation/reply`
- `/api/conversation/pronunciation`
- `/api/tts`

---

## Important deployment notes

- Do **not** upload `node_modules`
- Commit `package.json` and `package-lock.json`
- If `npm ci` fails, regenerate lockfile locally:

```bash
rm -rf node_modules package-lock.json
npm install
```

- API and Worker must share the **same** `REDIS_URL` and `DATABASE_URL`
- If OpenAI is temporarily unavailable, app fallback will still work if `ENABLE_FALLBACK=true`

---

## Scale tips

- Scale **worker replicas first** when AI queue grows
- Keep API replicas small and stateless
- Cache repeated TTS and repeated prompts
- Use premium soft limits to prevent runaway costs

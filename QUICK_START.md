# SpeakFlow API Server

## Local
```bash
npm install
npm run dev
```

## Railway
- Build command: `npm install`
- Start command: `npm start`

## Required env
- OPENAI_API_KEY
- DATABASE_URL
- REDIS_URL
- NODE_ENV=production
- ENABLE_FALLBACK=true
- FREE_DAILY_LIMIT=3
- PREMIUM_DAILY_SOFT_LIMIT=50
- ENABLE_PREMIUM_SOFT_LIMIT=true
- ALLOW_ORIGINS=*

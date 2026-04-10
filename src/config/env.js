import 'dotenv/config';

function required(name, fallback = '') {
  return process.env[name] || fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  logLevel: process.env.LOG_LEVEL || 'info',
  apiBaseUrl: required('API_BASE_URL', 'http://localhost:8080'),
  allowOrigins: required('ALLOW_ORIGINS', '*'),
  redisUrl: required('REDIS_URL'),
  databaseUrl: required('DATABASE_URL'),
  freeDailyLimit: Number(process.env.FREE_DAILY_LIMIT || 3),
  premiumDailySoftLimit: Number(process.env.PREMIUM_DAILY_SOFT_LIMIT || 50),
  freeConversationTurnsDaily: Number(process.env.FREE_CONVERSATION_TURNS_DAILY || 10),
  premiumConversationTurnsDaily: Number(process.env.PREMIUM_CONVERSATION_TURNS_DAILY || 150),
  enableFallback: String(process.env.ENABLE_FALLBACK || 'true') === 'true',
  openaiModelText: required('OPENAI_MODEL_TEXT', 'gpt-5.4-mini')
};

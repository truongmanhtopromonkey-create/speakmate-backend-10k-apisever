import { Router } from 'express';
import { env } from '../config/env.js';

export const configRouter = Router();
configRouter.get('/api/config', (_req, res) => {
  res.json({
    ok: true,
    freeDailyLimit: env.freeDailyLimit,
    premiumDailySoftLimit: env.premiumDailySoftLimit,
    freeConversationTurnsDaily: env.freeConversationTurnsDaily,
    premiumConversationTurnsDaily: env.premiumConversationTurnsDaily,
    fallbackEnabled: env.enableFallback,
    model: env.openaiModelText
  });
});

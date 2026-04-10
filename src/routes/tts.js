import { Router } from 'express';
import { ttsRequestSchema } from '../../shared/src/schemas.js';
import { ttsQueue } from '../services/queue.js';
import { ttsQueueEvents } from '../services/queueEvents.js';
import { incrementUsage } from '../services/usage.js';

export const ttsRouter = Router();

ttsRouter.post('/api/tts', async (req, res, next) => {
  try {
    const input = ttsRequestSchema.parse(req.body);
    const job = await ttsQueue.add('tts-generate', {
      appUserId: req.appUserId,
      isPremium: req.isPremium,
      payload: input
    });

    const result = await job.waitUntilFinished(ttsQueueEvents, 60_000);
    await incrementUsage(req.appUserId, 'tts_count');

    if (result.url) {
      return res.json(result);
    }

    const buffer = Buffer.from(result.base64Audio, 'base64');
    res.setHeader('Content-Type', result.contentType || 'audio/mpeg');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

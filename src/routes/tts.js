import { Router } from 'express';
import { ttsRequestSchema } from '../workers/schemas.js';
import { ttsQueue } from '../services/queue.js';
import { ttsQueueEvents } from '../services/queueEvents.js';
import { assertTtsAllowed, getOrCreateUser, incrementFeatureTrial, incrementUsage } from '../services/usage.js';

export const ttsRouter = Router();

ttsRouter.post('/api/tts', async (req, res, next) => {
  try {
    const input = ttsRequestSchema.parse(req.body);
    await getOrCreateUser(req.appUserId, req.isPremium);
    await assertTtsAllowed(req.appUserId, req.isPremium);
    const job = await ttsQueue.add('tts-generate', {
      appUserId: req.appUserId,
      isPremium: req.isPremium,
      payload: input
    });

    const result = await job.waitUntilFinished(ttsQueueEvents, 60_000);
    if (!req.isPremium) {
      await incrementFeatureTrial(req.appUserId, 'tts_voice');
    }
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

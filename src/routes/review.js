import { Router } from 'express';
import { reviewSpeakingRequestSchema } from '../workers/schemas.js';
import { makeHash, getJson, setJson } from '../services/cache.js';
import { reviewQueue } from '../services/queue.js';
import { reviewQueueEvents } from '../services/queueEvents.js';
import { assertReviewAllowed, getOrCreateUser, incrementFeatureTrial, incrementUsage } from '../services/usage.js';

export const reviewRouter = Router();

reviewRouter.post('/api/review-speaking', async (req, res, next) => {
  try {
    const input = reviewSpeakingRequestSchema.parse(req.body);
    await getOrCreateUser(req.appUserId, req.isPremium);
    const featureKey = input.source === 'quick_drill' || input.source === 'challenge' ? 'quick_drill' : 'speaking_practice';
    await assertReviewAllowed(req.appUserId, req.isPremium, featureKey);

    const cacheKey = `review:${makeHash({ ...input, premium: req.isPremium })}`;
    const cached = await getJson(cacheKey);
    if (cached) {
      return res.json({ ...cached, meta: { ...(cached.meta || {}), cached: true, isPremium: req.isPremium } });
    }

    const job = await reviewQueue.add('review-speaking', {
      appUserId: req.appUserId,
      isPremium: req.isPremium,
      payload: input,
      cacheKey
    });

    const result = await job.waitUntilFinished(reviewQueueEvents, 30_000);
    if (!req.isPremium) {
      await incrementFeatureTrial(req.appUserId, featureKey);
    }
    await incrementUsage(req.appUserId, 'review_count');
    await setJson(cacheKey, result, 600);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

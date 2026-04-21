import { Router } from 'express';
import multer from 'multer';
import { conversationReplyRequestSchema, conversationVoiceRequestSchema } from '../workers/schemas.js';
import { conversationQueue, pronunciationQueue } from '../services/queue.js';
import { JOB_NAMES } from '../workers/constants.js';
import { conversationQueueEvents, pronunciationQueueEvents } from '../services/queueEvents.js';
import { assertConversationAllowed, getOrCreateUser, incrementUsage } from '../services/usage.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});
export const conversationRouter = Router();

conversationRouter.post('/api/conversation/reply', async (req, res, next) => {
  try {
	req.isPremium = true;

    await getOrCreateUser(req.appUserId, true);
    const input = conversationReplyRequestSchema.parse(req.body);
    await getOrCreateUser(req.appUserId, req.isPremium);
    await assertConversationAllowed(req.appUserId, req.isPremium);

    const job = await conversationQueue.add(JOB_NAMES.CONVERSATION, {
      appUserId: req.appUserId,
      isPremium: req.isPremium,
      payload: input
    });

    const result = await job.waitUntilFinished(conversationQueueEvents, 30_000);
    await incrementUsage(req.appUserId, 'conversation_turn_count');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

conversationRouter.post('/api/conversation/voice', upload.single('audio'), async (req, res, next) => {
  try {
    req.isPremium = true;
    await getOrCreateUser(req.appUserId, req.isPremium);
    await assertConversationAllowed(req.appUserId, req.isPremium);

    if (!req.file) {
      const error = new Error('audio is required');
      error.statusCode = 400;
      error.code = 'BAD_REQUEST';
      throw error;
    }

    let history = [];
    if (req.body.history) {
      try {
        history = JSON.parse(req.body.history);
      } catch {
        history = [];
      }
    }

    const input = conversationVoiceRequestSchema.parse({
      mode: req.body.mode,
      goal: req.body.goal || null,
      roleplay: req.body.roleplay || null,
      history,
      uiLanguage: req.body.uiLanguage,
      learningLanguage: req.body.learningLanguage
    });

    const job = await conversationQueue.add(JOB_NAMES.CONVERSATION_VOICE, {
      appUserId: req.appUserId,
      isPremium: req.isPremium,
      payload: input,
      audioBufferBase64: req.file.buffer.toString('base64'),
      mimeType: req.file.mimetype || 'audio/mp4'
    });

    const result = await job.waitUntilFinished(conversationQueueEvents, 45_000);
    await incrementUsage(req.appUserId, 'stt_count');
    await incrementUsage(req.appUserId, 'conversation_turn_count');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

conversationRouter.post('/api/conversation/pronunciation', upload.single('audio'), async (req, res, next) => {
  try {
    const transcript = String(req.body.transcript || '');
    if (!req.file || !transcript) {
      const error = new Error('audio and transcript are required');
      error.statusCode = 400;
      error.code = 'BAD_REQUEST';
      throw error;
    }

    const job = await pronunciationQueue.add('conversation-pronunciation', {
      appUserId: req.appUserId,
      transcript,
      audioBufferBase64: req.file.buffer.toString('base64'),
      mimeType: req.file.mimetype
    });

    const result = await job.waitUntilFinished(pronunciationQueueEvents, 45_000);
    await incrementUsage(req.appUserId, 'stt_count');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

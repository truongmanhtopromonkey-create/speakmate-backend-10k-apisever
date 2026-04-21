import { Router } from 'express';
import multer from 'multer';
import { conversationReplyRequestSchema } from '../workers/schemas.js';
import { conversationQueue, pronunciationQueue } from '../services/queue.js';
import { JOB_NAMES } from '../workers/constants.js';
import { conversationQueueEvents, pronunciationQueueEvents } from '../services/queueEvents.js';
import { assertConversationAllowed, getOrCreateUser, incrementFeatureTrial, incrementUsage } from '../services/usage.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});
export const conversationRouter = Router();

conversationRouter.post('/api/conversation/reply', async (req, res, next) => {
  try {
    const input = conversationReplyRequestSchema.parse(req.body);
    await getOrCreateUser(req.appUserId, req.isPremium);
    await assertConversationAllowed(req.appUserId, req.isPremium);

    const job = await conversationQueue.add(JOB_NAMES.CONVERSATION, {
      appUserId: req.appUserId,
      isPremium: req.isPremium,
      payload: input
    });

    const result = await job.waitUntilFinished(conversationQueueEvents, 30_000);
    if (!req.isPremium) {
      await incrementFeatureTrial(req.appUserId, 'ai_conversation');
    }
    await incrementUsage(req.appUserId, 'conversation_turn_count');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

conversationRouter.post('/api/conversation/voice', async (req, res) => {
  res.status(410).json({
    ok: false,
    code: 'VOICE_UPLOAD_DISABLED',
    error: 'Voice upload is disabled for AI conversation. Use Apple Speech recognition on device and send the transcript to /api/conversation/reply.'
  });
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

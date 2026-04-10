import { Queue } from 'bullmq';
import { redis } from '../lib/redis.js';
import { QUEUES } from '../workers/constants.js';

const common = { connection: redis, defaultJobOptions: { removeOnComplete: 100, removeOnFail: 200 } };

export const reviewQueue = new Queue(QUEUES.REVIEW, common);
export const conversationQueue = new Queue(QUEUES.CONVERSATION, common);
export const pronunciationQueue = new Queue(QUEUES.PRONUNCIATION, common);
export const ttsQueue = new Queue(QUEUES.TTS, common);

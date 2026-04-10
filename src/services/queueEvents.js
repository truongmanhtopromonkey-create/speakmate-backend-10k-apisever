import { QueueEvents } from 'bullmq';
import { redis } from '../lib/redis.js';
import { QUEUES } from '../worker/constants.js';

export const reviewQueueEvents = new QueueEvents(QUEUES.REVIEW, { connection: redis });
export const conversationQueueEvents = new QueueEvents(QUEUES.CONVERSATION, { connection: redis });
export const pronunciationQueueEvents = new QueueEvents(QUEUES.PRONUNCIATION, { connection: redis });
export const ttsQueueEvents = new QueueEvents(QUEUES.TTS, { connection: redis });

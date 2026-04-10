import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { authContext } from './middleware/authContext.js';
import { burstLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { configRouter } from './routes/config.js';
import { reviewRouter } from './routes/review.js';
import { conversationRouter } from './routes/conversation.js';
import { ttsRouter } from './routes/tts.js';

const app = express();
app.use(cors({ origin: env.allowOrigins === '*' ? true : env.allowOrigins.split(',') }));
app.use(express.json({ limit: '4mb' }));
app.use(pinoHttp({ logger }));
app.use(authContext);
app.use(burstLimiter);
app.use(healthRouter);
app.use(configRouter);
app.use(reviewRouter);
app.use(conversationRouter);
app.use(ttsRouter);
app.use(errorHandler);

app.listen(env.port, () => {
  logger.info({ port: env.port }, 'api server started');
});

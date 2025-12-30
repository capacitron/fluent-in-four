import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRateLimit } from './middleware/rateLimit.js';

// Routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import languagesRoutes from './routes/languages.js';
import lessonsRoutes from './routes/lessons.js';
import progressRoutes from './routes/progress.js';
import gamificationRoutes from './routes/gamification.js';
import recordingsRoutes from './routes/recordings.js';
import adminRoutes from './routes/admin.js';

export function createApp(): Express {
  const app = express();

  // Trust proxy for rate limiting
  app.set('trust proxy', 1);

  // CORS
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Cookie parsing
  app.use(cookieParser());

  // Rate limiting
  app.use('/api', apiRateLimit);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/languages', languagesRoutes);
  app.use('/api/lessons', lessonsRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/gamification', gamificationRoutes);
  app.use('/api/recordings', recordingsRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}

import express, { type RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { logger } from './lib/logger';
import { corsConfig } from './config/cors';
import { swaggerSetup } from './config/swagger';
import { requestIdMiddleware } from './middlewares/requestId.middleware';
import { rateLimiterMiddleware } from './middlewares/rateLimiter.middleware';
import { notFoundMiddleware } from './middlewares/notFound.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import v1Router from './routes/v1';

const app = express();

// Global middleware (order matters)
app.use(requestIdMiddleware as RequestHandler);
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/v1/health' } }) as RequestHandler);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  }) as RequestHandler,
);
app.use(cors(corsConfig) as RequestHandler);
app.use(compression() as RequestHandler);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser() as RequestHandler);
app.use(rateLimiterMiddleware as RequestHandler);

// API docs
swaggerSetup(app);

// Routes
app.use('/api/v1', v1Router);

// Error handling (must be last)
app.use(notFoundMiddleware as RequestHandler);
app.use(errorMiddleware as unknown as RequestHandler);

export { app };

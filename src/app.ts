import 'reflect-metadata';
import express, { type Request, type Response } from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from './config/logger.js';
import { applySecurityMiddleware } from './config/security.js';
import { responseWrapper } from './shared/middleware/responseWrapper.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
// import { healthRoutes } from './modules/health/health.routes.js';
import { setupSwagger } from './config/swagger.js';
// import { requestIdMiddleware } from './shared/middleware/requestId';
import cors from 'cors';
import { getCorsOptions } from '@shared/middleware/cors.js';

export function createApp() {
  const app = express();

  // Essential middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // Aplicar el middleware CORS
  app.use(cors(getCorsOptions()));

  // Request ID
  // app.use(requestIdMiddleware);

  // HTTP logging
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as any).requestId,
    }),
  );

  // Security
  applySecurityMiddleware(app);

  // Response wrapper (must be before routes)
  app.use(responseWrapper);

  // Swagger
  setupSwagger(app);

  // Routes
  // Ruta de ejemplo
  app.get('/', (req: Request, res: Response) => {
    res.json({ mensaje: '¡Hola Dardo, muy bien desde Express + TypeScript!' });
  });
  // app.use('/api', healthRoutes);

  // Global error handler (after routes)
  app.use(errorHandler);

  return app;
}

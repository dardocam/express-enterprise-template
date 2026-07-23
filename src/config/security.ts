import { type Application } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { getCorsOptions } from './cors.js';
import cors from 'cors';

dotenv.config();


export function applySecurityMiddleware(app: Application) {
  app.use(helmet());
  app.use(cors(getCorsOptions()));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
}
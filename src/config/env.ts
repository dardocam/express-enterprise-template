import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'debug',
  jwtSecret: process.env.JWT_SECRET || 'default_secret',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

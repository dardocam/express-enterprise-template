import pino, { type LoggerOptions } from 'pino';
import { env } from './env.js';

interface LoggerRequest {
  id: string;
  method: string;
  url: string;
}

interface LoggerResponse {
  statusCode: number;
}

const transport: LoggerOptions['transport'] | undefined = env.nodeEnv === 'development'
  ? { target: 'pino-pretty', options: { colorize: true } }
  : undefined;

const options: pino.LoggerOptions = {
  level: env.logLevel,
  serializers: {
    req: (req: LoggerRequest): LoggerRequest => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res: LoggerResponse): LoggerResponse => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
};

if (transport) {
  options.transport = transport;
}

export const logger = pino(options);
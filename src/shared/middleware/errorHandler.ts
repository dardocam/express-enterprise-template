import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { type ApiResponse } from '../types/response.js';
import { logger } from '../../config/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error({ err, requestId: req.requestId }, 'Unhandled error');

  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      data: null,
      error: err.isOperational ? err.message : 'Internal server error',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    };
    return res.status(err.statusCode).json(response);
  }

  // Unknown error
  const response: ApiResponse = {
    success: false,
    statusCode: 500,
    message: 'Internal server error',
    data: null,
    error: 'Something went wrong',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };
  return res.status(500).json(response);
}

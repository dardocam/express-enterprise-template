import { type Request, type Response, type NextFunction } from 'express';
import { type ApiResponse } from '../types/response.js';

export function responseWrapper(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);

  res.json = (body: any) => {
    // If body is already an ApiResponse, don't double wrap
    if (body && body.success !== undefined && body.statusCode) {
      return originalJson(body);
    }

    const wrapped: ApiResponse = {
      success: true,
      statusCode: res.statusCode,
      message: 'OK',
      data: body,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    };
    return originalJson(wrapped);
  };

  next();
}

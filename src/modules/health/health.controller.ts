import { Request, Response } from 'express';
import { injectable } from 'tsyringe';

@injectable()
export class HealthController {
  getHealth(_req: Request, res: Response) {
    // La respuesta será envuelta automáticamente por responseWrapper
    res.status(200).json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
}

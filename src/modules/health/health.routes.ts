import { Router } from 'express';
import { container } from 'tsyringe';
import { HealthController } from './health.controller';

const router = Router();
const healthController = container.resolve(HealthController);

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Verifica el estado del servicio
 *     responses:
 *       200:
 *         description: Servicio operativo
 */
router.get('/health', (req, res) => healthController.getHealth(req, res));

export { router as healthRoutes };

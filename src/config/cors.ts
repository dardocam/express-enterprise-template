import dotenv from 'dotenv';
dotenv.config();
import { type CorsOptions } from 'cors';

// Configuración base de CORS
export const getCorsOptions = (): CorsOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const corsOrigin = process.env.CORS_ORIGIN;

  if (nodeEnv === 'production') {
    // En producción, solo se permiten los orígenes definidos en CORS_ORIGIN
    const allowedOrigins = corsOrigin
      ? corsOrigin.split(',').map(origin => origin.trim())
      : [];

    return {
      origin: (origin, callback) => {
        // Permitir herramientas sin origen (Postman, apps móviles)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Origen no permitido por CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    };
  }

  // En desarrollo, se permite cualquier localhost y también la variable CORS_ORIGIN si se define
  return {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      // Permitir cualquier origen que contenga 'localhost' (por si cambiás de puerto)
      if (origin.includes('localhost')) {
        return callback(null, true);
      }
      // Si definiste una variable específica, también se permite
      if (corsOrigin && corsOrigin.split(',').map(o => o.trim()).includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Origen no permitido por CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  };
};

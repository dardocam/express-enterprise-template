import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors, { type CorsOptions } from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración base de CORS
const getCorsOptions = (): CorsOptions => {
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

// Aplicar el middleware CORS
app.use(cors(getCorsOptions()));

// Middleware para parsear JSON
app.use(express.json());

// Ruta de ejemplo
app.get('/', (req: Request, res: Response) => {
  res.json({ mensaje: '¡Hola Dardo, muy bien desde Express + TypeScript!' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
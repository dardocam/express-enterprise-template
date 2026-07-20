import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware para parsear JSON
app.use(express.json());

// Ruta de ejemplo
app.get('/', (req: Request, res: Response) => {
  res.json({ mensaje: '¡Hola Dardo, muy bien desde Express + TypeScript!' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
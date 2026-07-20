## ¿Qué es CORS y por qué se utiliza?

**CORS** (Cross-Origin Resource Sharing) es un mecanismo de seguridad que implementan los navegadores para controlar las solicitudes HTTP entre distintos orígenes (dominio, protocolo o puerto).

- **Origen** = combinación de `protocolo + dominio + puerto`.  
  Ejemplo: `http://localhost:5173` (frontend) y `http://localhost:3000` (tu API) son **orígenes distintos** aunque estén en la misma máquina, porque los puertos son diferentes.

### ¿Por qué el navegador bloquea estas solicitudes?
Por la política de **same-origin** (mismo origen): un script que se ejecuta en una página solo puede hacer peticiones a su mismo origen, a menos que el servidor destino lo permita explícitamente mediante cabeceras CORS. Esto evita que sitios maliciosos lean datos de tu API sin permiso.

### ¿Cuándo necesitás CORS?
Siempre que tu frontend y backend estén en orígenes diferentes:
- Frontend corriendo en `localhost:5173` (Vite/React) y API en `localhost:3000`.
- Frontend desplegado en `miapp.com` y API en `api.miapp.com`.
- Aplicaciones móviles o de escritorio que consuman tu API (aunque ahí no aplica el navegador, igual conviene tenerlo).

---

## Cómo agregar CORS a tu proyecto

### 1. Instalá el paquete `cors` y sus tipos

```bash
npm install cors
npm install -D @types/cors
```

### 2. Usalo como middleware en tu servidor Express

Editá `src/index.ts` (o donde tengas la configuración de Express) e importá el middleware:

```typescript
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware CORS - habilita todos los orígenes (para desarrollo)
app.use(cors());

// ... resto de middlewares y rutas
app.use(express.json());
```

Con `app.use(cors())` **sin opciones**, se permiten solicitudes desde **cualquier origen**. Esto es práctico durante el desarrollo, pero en producción deberías restringir los orígenes permitidos.

---

## Configuración recomendada para producción

Para mayor seguridad, especificá qué orígenes pueden acceder a tu API:

```typescript
const allowedOrigins = ['https://tudominio.com', 'https://www.tudominio.com'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como Postman o mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  credentials: true // Si usás cookies o autenticación basada en sesión
}));
```

O, de forma más simple, con un array:

```typescript
app.use(cors({
  origin: 'https://tudominio.com',
  methods: ['GET', 'POST']
}));
```

---

## Resumen

- **Instalá**: `cors` y `@types/cors`.
- **Agregá**: `app.use(cors())` antes de tus rutas.
- **Explicación**: le dice al navegador "este servidor acepta peticiones de otros orígenes", evitando el bloqueo por same-origin policy.
- **Producción**: restringí los orígenes para no exponer tu API a cualquier sitio.

Con eso tu API ya puede ser consumida desde cualquier frontend sin errores de CORS en el navegador.


---

Te entiendo: querés que en **desarrollo** se acepten peticiones desde `localhost` (para poder probar el frontend local), pero en **producción** solo se permitan los dominios reales de tu aplicación.

La clave está en usar **variables de entorno** para cambiar la configuración de CORS según el entorno.

---

## 1. Preparar variables de entorno

Instalá `dotenv` para manejar un archivo `.env` en desarrollo:

```bash
npm install dotenv
```

Creá dos archivos en la raíz del proyecto:

**.env** (para desarrollo)
```
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**.env.production** (como referencia, pero en producción las variables se definen en el servidor)
```
NODE_ENV=production
CORS_ORIGIN=https://tudominio.com,https://www.tudominio.com
```

> Nota: el archivo `.env` **no se sube a Git** (agregalo a `.gitignore`). En producción, definís las variables de entorno directamente en la plataforma de despliegue (Vercel, Heroku, Railway, etc.).

---

## 2. Configuración condicional de CORS

Modificá tu archivo principal (`src/index.ts`) para cargar las variables de entorno y armar la configuración de CORS según el entorno.

```typescript
import dotenv from 'dotenv';
dotenv.config(); // Solo en desarrollo, en producción las vars ya están

import express, { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';

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

// Middleware para JSON
app.use(express.json());

// Rutas...
app.get('/', (req: Request, res: Response) => {
  res.json({ mensaje: 'API funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
```

---

## 3. Cómo funciona

- **Desarrollo**: si `NODE_ENV` no es `production`, o no está definida, CORS acepta cualquier solicitud que provenga de una URL que incluya `localhost` (sin importar el puerto), y también los orígenes que pongas manualmente en `CORS_ORIGIN`.
- **Producción**: cuando `NODE_ENV=production`, solo se permiten los orígenes que especifiques en `CORS_ORIGIN` (separados por coma). Cualquier otro origen será rechazado con un error.

---

## 4. Probar el comportamiento

- En tu máquina local, ejecutá `npm run dev`. Con `NODE_ENV=development`, tu frontend en `http://localhost:5173` funcionará sin problemas.
- En producción, definí las variables de entorno en tu plataforma:
  - `NODE_ENV=production`
  - `CORS_ORIGIN=https://miapp.com,https://www.miapp.com`

Así mantenés la seguridad en producción y la comodidad en desarrollo.

¡Excelente pregunta! Es muy común confundirse con esto. La razón es que **Thunder Client** (al igual que Postman, Insomnia o `curl`) **no es un navegador**.

---

## El problema de CORS solo existe en los navegadores

CORS (Cross-Origin Resource Sharing) es una política de seguridad que **implementan exclusivamente los navegadores web**. Su propósito es evitar que un script malicioso, ejecutándose en una página, haga peticiones a otro dominio sin permiso.

Cuando usás Thunder Client:
- Es una aplicación de escritorio (o extensión de VSCode) que envía solicitudes HTTP directamente, como un cliente HTTP puro.
- **No hay un navegador** que intercepte la respuesta, revise las cabeceras CORS y bloquee el acceso si no son válidas.
- Simplemente muestra la respuesta del servidor, sin importar si el servidor incluye o no las cabeceras `Access-Control-Allow-Origin`.

---

## ¿Cuándo necesitás CORS entonces?

Lo necesitás únicamente cuando un **frontend web** (por ejemplo, una SPA hecha con React, Vue o vanilla JS) intenta consumir tu API desde un origen diferente (distinto dominio, puerto o protocolo). El navegador del usuario será quien exija esas cabeceras.

---

## Resumen visual

| Cliente HTTP          | ¿Bloquea por falta de CORS? | ¿Por qué? |
|-----------------------|-----------------------------|-----------|
| Navegador (Chrome, Firefox, etc.) | ✅ Sí | Aplica política de same-origin para proteger al usuario |
| Thunder Client / Postman / curl | ❌ No | Son clientes directos que ignoran la política de seguridad del navegador |

Por eso tu API funciona perfecto con Thunder Client sin haber configurado CORS. Solo tendrías problemas si intentás llamarla desde una página web con JavaScript en el navegador.

¿Te queda más claro ahora? 🚀
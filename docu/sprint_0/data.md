Para montar un proyecto con Express + TypeScript desde cero y dejarlo listo para desarrollar, aquí tienes una guía paso a paso con todo lo necesario.

---

## 1. Requisitos previos

Asegúrate de tener instalado **Node.js** (versión LTS recomendada) y **npm** (viene con Node). Puedes verificarlo con:

```bash
node -v
npm -v
```

---

## 2. Crear la carpeta del proyecto e iniciar npm

```bash
mkdir mi-api
cd mi-api
npm init -y
```

Esto genera el `package.json` inicial.

---

## 3. Instalar dependencias

### Dependencias de producción
```bash
npm install express
```

### Dependencias de desarrollo
Necesitamos TypeScript, los tipos de Express y Node, y una herramienta para ejecutar TypeScript directamente en desarrollo sin compilar manualmente cada vez.

```bash
npm install -D typescript @types/express @types/node tsx @types/node
npm install -D nodemon
```

- **typescript**: el compilador de TS.
- **@types/express** y **@types/node**: definiciones de tipos para Express y Node.
- **tsx** (ejecuta TypeScript directamente, sin necesidad de ts-node) junto con un simple observador como nodemon o el flag --watch de Node.js.
---

## 4. Configurar TypeScript

Genera el archivo `tsconfig.json`:

```bash
npx tsc --init
```

Ábrelo y ajusta estas opciones (o reemplaza el contenido por el siguiente):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Lo más importante:
- `rootDir`: carpeta donde estará nuestro código TypeScript (crearemos `src`).
- `outDir`: carpeta de salida del JavaScript compilado (para producción).
- `strict`: activa todas las comprobaciones estrictas de tipos.
- `esModuleInterop`: permite importar módulos CommonJS como si fueran ES Modules.

---

## 5. Estructura de carpetas

Crea la carpeta `src` y el archivo principal:

```
mi-api/
├── src/
│   └── index.ts
├── dist/          (se generará al compilar)
├── node_modules/
├── package.json
├── tsconfig.json
└── .gitignore     (opcional pero recomendado)
```

Añade un `.gitignore` básico:

```
node_modules
dist
.env
```

---

## 6. Servidor Express mínimo

Edita `src/index.ts`:

```typescript
import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta de ejemplo
app.get('/', (req: Request, res: Response) => {
  res.json({ mensaje: '¡Hola desde Express + TypeScript!' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
```

---

## 7. Scripts en package.json

Reemplaza la sección `"scripts"` de tu `package.json`:

```json
"scripts": {
  "dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

- `dev`: inicia el servidor en modo desarrollo con recarga automática.
- `build`: compila TypeScript a JavaScript en la carpeta `dist`.
- `start`: arranca la versión compilada para producción.

---

## 8. Probar el proyecto

Ejecuta el modo desarrollo:

```bash
npm run dev
```

Deberías ver:

```
Servidor corriendo en http://localhost:3000
```

Abre tu navegador en `http://localhost:3000` o usa `curl` y recibirás el JSON de prueba.

---

## 9. Siguientes pasos (opcionales pero muy útiles)

### Variables de entorno
Instala `dotenv` y crea un archivo `.env`:

```bash
npm install dotenv
```

En `src/index.ts`, al inicio:

```typescript
import dotenv from 'dotenv';
dotenv.config();
```

### Linter y formateador (ESLint + Prettier)
Una configuración robusta incluye ESLint con el parser de TypeScript y Prettier. Instálalos siguiendo guías oficiales para mantener un código limpio.

### Organizar rutas
Crea una carpeta `src/routes` y `src/controllers` para ir escalando la API de forma modular.

---

Con esto ya tienes un proyecto Express con TypeScript completamente funcional y preparado para desarrollar cualquier backend moderno. 🚀
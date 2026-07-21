Perfecto. Te entrego el esqueleto inicial completo del **Express Enterprise Template (EET) v1.0**, cubriendo toda la Fase 1 hasta el Health Module funcional. Incluye todas las dependencias, configuración, shared kernel, DI, logging, seguridad, manejo de errores, response wrapper y Swagger. Solo tienes que copiar los archivos, instalar las dependencias y ejecutar.

---

## 📁 Estructura del proyecto

```
express-enterprise-template/
├── .env.example
├── .eslintrc.js
├── .gitignore
├── .husky/
│   └── pre-commit
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── lint-staged.config.js
├── package.json
├── tsconfig.json
└── src/
    ├── app.ts
    ├── server.ts
    ├── config/
    │   ├── env.ts
    │   ├── logger.ts
    │   ├── security.ts
    │   └── swagger.ts
    ├── shared/
    │   ├── container/
    │   │   └── index.ts
    │   ├── errors/
    │   │   └── AppError.ts
    │   ├── kernel/
    │   │   ├── AggregateRoot.ts
    │   │   ├── DomainEvent.ts
    │   │   ├── Either.ts
    │   │   ├── Entity.ts
    │   │   ├── Identifier.ts
    │   │   ├── Result.ts
    │   │   ├── Specification.ts
    │   │   ├── UniqueId.ts
    │   │   └── ValueObject.ts
    │   ├── middleware/
    │   │   ├── errorHandler.ts
    │   │   ├── requestId.ts
    │   │   └── responseWrapper.ts
    │   └── types/
    │       └── response.ts
    └── modules/
        └── health/
            ├── health.controller.ts
            ├── health.routes.ts
            └── __tests__/
                └── health.test.ts
```

*(En versiones futuras agregarás la carpeta `modules/employee`)*

---

## 📦 Dependencias (`package.json`)

```json
{
  "name": "express-enterprise-template",
  "version": "1.0.0",
  "description": "Express Enterprise Template - Spring Boot style backend with TypeScript",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts",
    "test": "jest --passWithNoTests",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write 'src/**/*.ts'",
    "prepare": "husky install"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.3.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "pino": "^9.3.2",
    "pino-http": "^10.2.0",
    "pino-pretty": "^11.2.2",
    "reflect-metadata": "^0.2.2",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "tsyringe": "^4.8.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.14.9",
    "@types/swagger-jsdoc": "^6.0.4",
    "@types/swagger-ui-express": "^4.1.6",
    "@types/uuid": "^10.0.0",
    "@typescript-eslint/eslint-plugin": "^7.16.0",
    "@typescript-eslint/parser": "^7.16.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.3",
    "husky": "^9.0.11",
    "jest": "^29.7.0",
    "lint-staged": "^15.2.7",
    "prettier": "^3.3.2",
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.2",
    "ts-jest": "^29.2.2",
    "tsx": "^4.16.2",
    "typescript": "^5.5.3"
  },
  "lint-staged": {
    "src/**/*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## ⚙️ Configuraciones raíz

**`.env.example`**
```
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
JWT_SECRET=change_this_secret
```

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": "./src",
    "paths": {
      "@config/*": ["config/*"],
      "@shared/*": ["shared/*"],
      "@modules/*": ["modules/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**`.eslintrc.js`**
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'prettier/prettier': 'error',
  },
};
```

**`.prettierrc`**
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "semi": true
}
```

**`lint-staged.config.js`**
```javascript
module.exports = {
  'src/**/*.ts': ['eslint --fix', 'prettier --write'],
};
```

**`jest.config.js`**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/server.ts'],
};
```

**`Dockerfile`**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**`docker-compose.yml`**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
      - PORT=3000
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
```

**`.gitignore`**
```
node_modules/
dist/
.env
coverage/
```

**`.husky/pre-commit`**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npx lint-staged
```

---

## 🧠 Shared Kernel (`src/shared/kernel`)

**`Identifier.ts`**
```typescript
export class Identifier<T> {
  constructor(private readonly value: T) {
    this.value = value;
  }

  equals(id?: Identifier<T>): boolean {
    if (id === null || id === undefined) return false;
    if (!(id instanceof this.constructor)) return false;
    return id.toValue() === this.value;
  }

  toString(): string {
    return String(this.value);
  }

  toValue(): T {
    return this.value;
  }
}
```

**`UniqueId.ts`**
```typescript
import { Identifier } from './Identifier';
import { v4 as uuidv4, validate } from 'uuid';

export class UniqueId extends Identifier<string> {
  constructor(id?: string) {
    super(id || uuidv4());
    if (!validate(this.toValue())) {
      throw new Error('Invalid UUID');
    }
  }
}
```

**`Entity.ts`**
```typescript
import { UniqueId } from './UniqueId';

export abstract class Entity<T> {
  protected readonly _id: UniqueId;
  public readonly props: T;

  constructor(props: T, id?: UniqueId) {
    this._id = id || new UniqueId();
    this.props = props;
  }

  get id(): UniqueId {
    return this._id;
  }

  equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) return false;
    if (this === object) return true;
    if (!(object instanceof Entity)) return false;
    return this._id.equals(object._id);
  }
}
```

**`AggregateRoot.ts`**
```typescript
import { Entity } from './Entity';
import { UniqueId } from './UniqueId';
import { DomainEvent } from './DomainEvent';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }
}
```

**`ValueObject.ts`**
```typescript
interface ValueObjectProps {
  [index: string]: any;
}

export abstract class ValueObject<T extends ValueObjectProps> {
  public readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) return false;
    if (vo.props === undefined) return false;
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
```

**`DomainEvent.ts`**
```typescript
import { UniqueId } from './UniqueId';

export abstract class DomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly eventId: UniqueId;

  constructor() {
    this.dateTimeOccurred = new Date();
    this.eventId = new UniqueId();
  }

  abstract get aggregateId(): UniqueId;
}
```

**`Result.ts`**
```typescript
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  private error: string | null;
  private _value: T | null;

  private constructor(isSuccess: boolean, error?: string | null, value?: T) {
    if (isSuccess && error) throw new Error('A result cannot be successful and contain an error');
    if (!isSuccess && !error) throw new Error('A failing result needs to contain an error message');

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error || null;
    this._value = value || null;
  }

  public getValue(): T {
    if (!this.isSuccess) throw new Error('Cannot get the value of a failed result.');
    return this._value as T;
  }

  public getErrorValue(): string {
    if (this.isSuccess) throw new Error('Cannot get the error of a successful result.');
    return this.error as string;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }
}
```

**`Either.ts`**
```typescript
export type Either<L, R> = Left<L, R> | Right<L, R>;

export class Left<L, R> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isLeft(): this is Left<L, R> {
    return true;
  }

  isRight(): this is Right<L, R> {
    return false;
  }
}

export class Right<L, R> {
  readonly value: R;

  constructor(value: R) {
    this.value = value;
  }

  isLeft(): this is Left<L, R> {
    return false;
  }

  isRight(): this is Right<L, R> {
    return true;
  }
}

export const left = <L, R>(l: L): Either<L, R> => new Left(l);
export const right = <L, R>(r: R): Either<L, R> => new Right(r);
```

**`Specification.ts`**
```typescript
export abstract class Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification<T>(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification<T>(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification<T>(this);
  }
}

class AndSpecification<T> extends Specification<T> {
  constructor(private left: Specification<T>, private right: Specification<T>) {
    super();
  }
  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

class OrSpecification<T> extends Specification<T> {
  constructor(private left: Specification<T>, private right: Specification<T>) {
    super();
  }
  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

class NotSpecification<T> extends Specification<T> {
  constructor(private spec: Specification<T>) {
    super();
  }
  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}
```

---

## ❌ Jerarquía de errores (`src/shared/errors/AppError.ts`)

```typescript
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Error') {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication Error') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BusinessError extends AppError {
  constructor(message: string) {
    super(message, 422);
  }
}

export class InfrastructureError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500, false);
  }
}
```

---

## 🧩 Shared Types & Middleware

**`src/shared/types/response.ts`**
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  error?: string;
  timestamp: string;
  path?: string;
}
```

**`src/shared/middleware/requestId.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestIdMiddleware(req: Request, _res: Response, next: NextFunction) {
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  next();
}
```

**`src/shared/middleware/responseWrapper.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/response';

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
```

**`src/shared/middleware/errorHandler.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ApiResponse } from '../types/response';
import { logger } from '../../config/logger';

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
```

---

## 🧰 Configuración (`src/config`)

**`env.ts`**
```typescript
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'debug',
  jwtSecret: process.env.JWT_SECRET || 'default_secret',
};
```

**`logger.ts`**
```typescript
import pino from 'pino';
import { env } from './env';

const transport = env.nodeEnv === 'development'
  ? { target: 'pino-pretty', options: { colorize: true } }
  : undefined;

export const logger = pino({
  level: env.logLevel,
  transport,
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});
```

**`security.ts`**
```typescript
import { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export function applySecurityMiddleware(app: Application) {
  app.use(helmet());
  app.use(cors());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
}
```

**`swagger.ts`**
```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express Enterprise Template API',
      version: '1.0.0',
      description: 'API documentada automáticamente con Swagger',
    },
    servers: [{ url: '/api' }],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Application) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```

---

## 🧪 Dependency Injection (`src/shared/container`)

**`src/shared/container/index.ts`**
```typescript
import { container } from 'tsyringe';

// Aquí registrarías todos los servicios de la aplicación.
// Por ahora no hay nada que registrar, pero se deja preparado.
// Ejemplo:
// container.registerSingleton<IUserRepository>('UserRepository', InMemoryUserRepository);

export { container };
```

---

## 🚀 Punto de entrada y app

**`src/app.ts`**
```typescript
import 'reflect-metadata';
import express from 'express';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import { applySecurityMiddleware } from './config/security';
import { setupSwagger } from './config/swagger';
import { requestIdMiddleware } from './shared/middleware/requestId';
import { responseWrapper } from './shared/middleware/responseWrapper';
import { errorHandler } from './shared/middleware/errorHandler';
import { healthRoutes } from './modules/health/health.routes';

export function createApp() {
  const app = express();

  // Essential middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request ID
  app.use(requestIdMiddleware);

  // HTTP logging
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as any).requestId,
      quiet: false,
    }),
  );

  // Security
  applySecurityMiddleware(app);

  // Response wrapper (must be before routes)
  app.use(responseWrapper);

  // Swagger
  setupSwagger(app);

  // Routes
  app.use('/api', healthRoutes);

  // Global error handler (after routes)
  app.use(errorHandler);

  return app;
}
```

**`src/server.ts`**
```typescript
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

app.listen(env.port, () => {
  logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
  logger.info(`Swagger docs available at http://localhost:${env.port}/api-docs`);
});
```

---

## 🏥 Módulo Health

**`src/modules/health/health.controller.ts`**
```typescript
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
```

**`src/modules/health/health.routes.ts`**
```typescript
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
```

**`src/modules/health/__tests__/health.test.ts`**
```typescript
import request from 'supertest';
import { createApp } from '../../../app';

describe('Health Module (e2e)', () => {
  const app = createApp();

  it('GET /api/health should return 200 and UP status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('UP');
    expect(response.body.data).toHaveProperty('uptime');
    expect(response.body.data).toHaveProperty('timestamp');
  });
});
```

---

## ▶️ Instrucciones de arranque

1. **Clonar/descargar** la estructura de archivos.
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # editar .env si es necesario
   ```
4. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```
5. **Probar el health endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   O abrir Swagger en `http://localhost:3000/api-docs`.

6. **Ejecutar tests:**
   ```bash
   npm test
   ```

7. **Docker (alternativa):**
   ```bash
   docker compose up
   ```

---

## 🧭 Siguientes pasos

Con esta base ya funcionando, puedes comenzar a construir el **Employee Module** siguiendo la misma arquitectura:

- Crear `src/modules/employee/`
- Definir la entidad `Employee` extendiendo `AggregateRoot`
- Crear `IEmployeeRepository` (interfaz en dominio)
- Implementar `InMemoryEmployeeRepository`
- Registrar la dependencia en el contenedor de `tsyringe`
- Construir caso de uso, DTO, controller y rutas.

Todo el shared kernel, manejo de errores, logging y seguridad ya están listos para ser usados en cada nuevo módulo.

---

Excelente decisión. A continuación, te explico archivo por archivo el ecosistema completo del **Express Enterprise Template (EET)**, detallando su responsabilidad, su razón de ser dentro de la arquitectura empresarial y cómo se conecta con el resto del sistema. El orden sigue la estructura de carpetas presentada.

---

## 📁 Raíz del proyecto

### `.env.example`
**Propósito:** Plantilla de variables de entorno.  
**Funcionalidad:** Define las variables que necesita la aplicación (`NODE_ENV`, `PORT`, `LOG_LEVEL`, `JWT_SECRET`). No contiene valores sensibles reales. El desarrollador copia este archivo a `.env` (que está en `.gitignore`) y lo personaliza.  
**Conexión:** Las lee `src/config/env.ts` mediante `dotenv`.

### `.eslintrc.js`
**Propósito:** Configuración del linter estático ESLint para TypeScript.  
**Funcionalidad:** Usa el parser de TypeScript, aplica reglas recomendadas, integra Prettier y permite personalizar reglas (por ejemplo, desactiva la obligación de tipar el retorno de funciones). Ayuda a mantener un código consistente y libre de errores comunes.  
**Conexión:** Se ejecuta manualmente (`npm run lint`) o en el pre‑commit de Husky.

### `.prettierrc`
**Propósito:** Configuración del formateador de código Prettier.  
**Funcionalidad:** Establece comillas simples, punto y coma, ancho máximo de 100 caracteres, etc. Asegura que todo el código tenga un estilo uniforme.  
**Conexión:** Usado por ESLint a través del plugin `eslint-plugin-prettier` y ejecutado con `npm run format`.

### `.gitignore`
Lista de archivos/carpetas que Git debe ignorar: `node_modules`, `dist`, `.env`, `coverage`. Evita subir dependencias, compilados y configuraciones sensibles.

### `lint-staged.config.js`
**Propósito:** Configuración de `lint-staged` para ejecutar linters solo en los archivos que están en el área de staging.  
**Funcionalidad:** Antes de cada commit, ejecuta ESLint con fix y Prettier sobre los archivos `.ts` modificados. Si algo falla, el commit se aborta.  
**Conexión:** Activado por Husky en el hook `pre-commit`.

### `.husky/pre-commit`
**Propósito:** Script del hook de Git gestionado por Husky.  
**Funcionalidad:** Se ejecuta `npx lint-staged` antes de permitir un commit. Garantiza que solo código limpio y formateado llegue al repositorio.  
**Conexión:** Husky se instala con `npm run prepare`.

### `jest.config.js`
**Propósito:** Configuración del framework de testing Jest con soporte para TypeScript.  
**Funcionalidad:** Usa `ts-jest` para transformar archivos TS, define el entorno Node, mapea los alias de rutas (`@config/*`, `@shared/*`, `@modules/*`) y excluye archivos de coverage (`server.ts`, archivos de test).  
**Conexión:** Se utiliza con `npm test` o `npm run test:coverage`.

### `docker-compose.yml`
**Propósito:** Orquestación de contenedores para desarrollo.  
**Funcionalidad:** Define un servicio `app` que construye la imagen desde el `Dockerfile`, mapea el puerto 3000, monta el código fuente como volumen para hot‑reloading (mediante `npm run dev`) y excluye `node_modules` del montaje para usar las dependencias del contenedor.  
**Conexión:** Con `docker compose up` levanta el entorno completo.

### `Dockerfile`
**Propósito:** Imagen de producción.  
**Funcionalidad:** Basada en Node 20 Alpine, copia los archivos de dependencias, ejecuta `npm ci` (instalación limpia), copia el código fuente, compila TypeScript y ejecuta `node dist/server.js`.  
**Conexión:** Lo usa `docker-compose.yml` para el servicio `app`.

---

## 📁 Configuración de TypeScript y paquetes

### `tsconfig.json`
**Propósito:** Configuración del compilador TypeScript.  
**Funcionalidad:**
- `target: ES2020`, `module: commonjs` (compatible con Node).
- `strict: true` para máxima seguridad de tipos.
- `experimentalDecorators` y `emitDecoratorMetadata`: necesarios para la inyección de dependencias con `tsyringe` (usa decoradores).
- `baseUrl` y `paths`: permiten importaciones limpias como `@shared/kernel/Entity` en lugar de rutas relativas largas.
- `outDir: dist` y `rootDir: src`.
- Excluye `node_modules` y tests de la compilación.

### `package.json`
**Propósito:** Manifiesto del proyecto, dependencias y scripts.  
**Funcionalidad:**
- Dependencias de producción: Express, Helmet, CORS, Rate Limit, Pino (logging), JWT, UUID, Tsyringe (DI), Swagger.
- Dependencias de desarrollo: TypeScript, ESLint/Prettier, Jest, Supertest, TSX (para ejecutar TS en desarrollo sin compilar), Husky, lint-staged, tipos de las librerías.
- Scripts: `dev` (tsx watch), `build` (tsc), `start` (node dist), `test`, `lint`, `format`, `prepare` (husky install).
- `lint-staged`: configuración embebida como objeto.

---

## 📁 `src/` – Código fuente

### `src/app.ts`
**Propósito:** Factoría que crea y configura la aplicación Express.  
**Funcionalidad:**
- Importa `reflect-metadata` (necesario para los decoradores de Tsyringe).
- Crea una instancia de Express.
- Añade middlewares en orden:
  1. `express.json` y `urlencoded`.
  2. `requestIdMiddleware` (asigna un ID único a cada petición).
  3. `pinoHttp` (logging HTTP con request id).
  4. Aplica seguridad (`helmet`, `cors`, `rateLimit`).
  5. `responseWrapper` (envuelve automáticamente las respuestas en la estructura `ApiResponse`).
  6. Configura Swagger en `/api-docs`.
  7. Monta las rutas bajo `/api` (por ahora solo `healthRoutes`).
  8. Registra el manejador global de errores después de las rutas.
- Retorna la app configurada.

**Rol en la arquitectura:** Separa la creación de la aplicación de su ejecución, facilitando tests (se importa `createApp` en lugar de importar la app ya escuchando).

### `src/server.ts`
**Propósito:** Punto de entrada real de la aplicación.  
**Funcionalidad:** Llama a `createApp()`, obtiene la app y la pone a escuchar en el puerto definido en `env`. Loguea un mensaje con la URL de Swagger.  
**Rol en la arquitectura:** Capa de infraestructura (arranque). No contiene lógica de negocio.

---

## 📁 `src/config/` – Configuraciones centralizadas

### `env.ts`
**Propósito:** Centraliza y tipa las variables de entorno.  
**Funcionalidad:** Carga `.env` con `dotenv`, expone un objeto `env` con valores por defecto (desarrollo, puerto 3000, etc.). Cualquier parte de la aplicación puede importar `env` sin preocuparse de `process.env` directamente.  
**Rol:** Fuente única de verdad para la configuración.

### `logger.ts`
**Propósito:** Configura el logger Pino.  
**Funcionalidad:** Crea una instancia de Pino con:
- Nivel de log según `env.logLevel`.
- En desarrollo usa `pino-pretty` para logs legibles con colores; en producción salida JSON.
- Serializadores personalizados para request y response (extrae `id`, método, URL, status).
- Exporta la instancia `logger` para uso en toda la app.

### `security.ts`
**Propósito:** Aplica middlewares de seguridad.  
**Funcionalidad:** Función `applySecurityMiddleware(app)` que añade:
- `helmet()`: protege contra vulnerabilidades web comunes (cabeceras HTTP).
- `cors()`: permite peticiones cross‑origin.
- `rateLimit`: limita a 100 peticiones por IP cada 15 minutos.

### `swagger.ts`
**Propósito:** Configura Swagger UI y la generación de especificación OpenAPI.  
**Funcionalidad:**  
- Define metadata básica (título, versión, servidor base `/api`).
- Escanea archivos de rutas/controladores en busca de anotaciones JSDoc (`@openapi`).
- Monta Swagger UI en `/api-docs` con la especificación generada.

---

## 📁 `src/shared/kernel/` – Shared Kernel DDD

### `Identifier.ts`
**Propósito:** Clase base para identificadores tipados.  
**Funcionalidad:** Genérica `<T>`, almacena un valor, permite comparar igualdad y convertir a string. Sirve como superclase de `UniqueId`.

### `UniqueId.ts`
**Propósito:** Identificador único basado en UUID v4.  
**Funcionalidad:** Extiende `Identifier<string>`, valida que sea un UUID válido al construirse. Si no se pasa un valor, genera uno nuevo. Usa la librería `uuid`. Es la representación de la identidad de una entidad.

### `Entity.ts`
**Propósito:** Clase base para entidades del dominio.  
**Funcionalidad:**  
- Contiene un `_id: UniqueId` y `props: T` (las propiedades específicas de la entidad).
- Proporciona un getter `id` y un método `equals` para comparar entidades por identidad (no por atributos).
- Es abstracta, debe ser extendida por entidades concretas.

### `AggregateRoot.ts`
**Propósito:** Representa una raíz agregada que puede generar eventos de dominio.  
**Funcionalidad:** Extiende `Entity`, añade una lista de `DomainEvent` y métodos `addDomainEvent`, `clearEvents`. Mantiene los eventos que ocurren dentro del agregado para su posterior despacho (por ejemplo, al guardar en repositorio). Fundamental para DDD y event‑driven.

### `ValueObject.ts`
**Propósito:** Clase base para objetos de valor.  
**Funcionalidad:**  
- Recibe `props` (objeto con índices) y las congela (`Object.freeze`) para inmutabilidad.
- Implementa `equals` comparando la estructura interna serializada (JSON.stringify). Los value objects no tienen identidad, se comparan por sus atributos.

### `DomainEvent.ts`
**Propósito:** Abstracción de un evento de dominio.  
**Funcionalidad:** Contiene `dateTimeOccurred` y `eventId` (UUID). Obliga a las subclases a implementar `aggregateId`. Se almacenan en el agregado raíz.

### `Result.ts`
**Propósito:** Patrón Result para manejo explícito de éxito/fracaso sin excepciones.  
**Funcionalidad:**  
- Clase con `isSuccess`, `isFailure`, y métodos `getValue()` (lanza error si falló) y `getErrorValue()`.
- Métodos estáticos `ok(value?)` y `fail(error)` para crear instancias.
- Muy útil en casos de uso y lógica de dominio.

### `Either.ts`
**Propósito:** Patrón Either (Left/Right) para representar dos posibles resultados (éxito o error) con tipos distintos.  
**Funcionalidad:** Define `Left` (error) y `Right` (valor correcto), funciones `left` y `right` para construirlos. Permite manejar flujos funcionales con discriminación de tipos.

### `Specification.ts`
**Propósito:** Implementación del patrón Specification para reglas de negocio combinables.  
**Funcionalidad:** Clase abstracta con `isSatisfiedBy`, operadores `and`, `or`, `not`. Incluye implementaciones concretas `AndSpecification`, `OrSpecification`, `NotSpecification`. Permite construir filtros complejos de manera declarativa (por ejemplo, para validaciones o consultas en repositorios).

---

## 📁 `src/shared/errors/` – Jerarquía de errores

### `AppError.ts`
**Propósito:** Jerarquía de excepciones tipadas de aplicación.  
**Funcionalidad:**  
- `AppError` abstracta con `statusCode` e `isOperational` (errores esperados vs. bugs).
- Subclases: `ValidationError` (400), `AuthenticationError` (401), `AuthorizationError` (403), `NotFoundError` (404), `BusinessError` (422), `InfrastructureError` (500, no operacional).
- Cada una tiene un mensaje por defecto pero permite personalizarlo.
- El `errorHandler` global las captura y construye la respuesta apropiada.

---

## 📁 `src/shared/middleware/` – Middlewares transversales

### `requestId.ts`
**Propósito:** Asigna un identificador único a cada petición.  
**Funcionalidad:** Middleware que lee `x-request-id` de la cabecera; si no existe, genera un UUID. Lo añade a `req.requestId` (usando aumento de tipos global). Permite correlacionar logs y respuestas.

### `responseWrapper.ts`
**Propósito:** Envuelve todas las respuestas JSON en una estructura estándar `ApiResponse`.  
**Funcionalidad:** Sobrescribe `res.json` para que cualquier llamada a `res.json(data)` produzca:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": <data>,
  "timestamp": "...",
  "path": "/api/..."
}
```
Si el cuerpo ya es un `ApiResponse` (por ejemplo, desde el error handler), no lo vuelve a envolver. Esto garantiza uniformidad en toda la API.

### `errorHandler.ts`
**Propósito:** Manejador global de errores de Express (4 argumentos).  
**Funcionalidad:**  
- Loguea el error usando Pino.
- Si el error es instancia de `AppError`, devuelve una respuesta estructurada con el código de estado y mensaje adecuados.
- Para errores desconocidos, devuelve 500 con mensaje genérico y loguea el stack.

---

## 📁 `src/shared/types/` – Tipos compartidos

### `response.ts`
**Propósito:** Interfaz TypeScript para la respuesta estándar.  
**Funcionalidad:** Define `ApiResponse<T>` con campos `success`, `statusCode`, `message`, `data`, `error?`, `timestamp`, `path?`. La usa el wrapper y el error handler.

---

## 📁 `src/shared/container/` – Inyección de dependencias

### `index.ts`
**Propósito:** Configuración del contenedor Tsyringe.  
**Funcionalidad:** Importa `container` de `tsyringe` y lo exporta. En este punto es un placeholder; cuando se añadan repositorios o servicios, se registrarán aquí usando `container.registerSingleton` o `register`. Los módulos pueden resolver dependencias automáticamente si sus clases llevan `@injectable()`.

---

## 📁 `src/modules/health/` – Módulo Health

### `health.controller.ts`
**Propósito:** Controlador del endpoint de salud.  
**Funcionalidad:**  
- Decorado con `@injectable()` para que Tsyringe lo pueda instanciar.
- Método `getHealth` que responde con estado `UP`, uptime del proceso y timestamp.
- No recibe dependencias externas; es autónomo.

### `health.routes.ts`
**Propósito:** Definición de rutas del módulo Health.  
**Funcionalidad:**  
- Crea un Router de Express.
- Resuelve una instancia de `HealthController` desde el contenedor Tsyringe (`container.resolve`).
- Define la ruta `GET /health` mapeada al método del controlador.
- Incluye anotación JSDoc `@openapi` para que Swagger documente automáticamente el endpoint.
- Exporta el router para ser montado en `app.ts`.

### `__tests__/health.test.ts`
**Propósito:** Test de integración del endpoint de salud.  
**Funcionalidad:**  
- Usa `supertest` para hacer una petición HTTP a la app creada con `createApp()`.
- Verifica que responda 200, que el cuerpo tenga `success: true`, que `data.status` sea `'UP'`, y que existan `uptime` y `timestamp`.
- No mockea nada, prueba la integración real de middlewares, rutas y controlador.

---

## 🔄 Flujo de una petición

1. Llega `GET /api/health`.
2. `requestIdMiddleware` asigna `requestId`.
3. `pinoHttp` loguea entrada y salida.
4. `helmet`, `cors`, `rateLimit` aplican chequeos.
5. `responseWrapper` se instala (no hace nada aún).
6. Swagger está disponible pero no interfiere.
7. Express enruta a `healthRoutes`, que llama al controlador.
8. El controlador hace `res.status(200).json({...})`.
9. El `json` sobrescrito por `responseWrapper` envuelve la respuesta con la estructura `ApiResponse`.
10. El cliente recibe el JSON uniforme.

Si ocurre un error, salta al `errorHandler` que construye un `ApiResponse` de error y lo envía.

---

## 🏗️ Visión arquitectónica

El template sigue los principios de **Clean Architecture** y **Domain‑Driven Design**:

- **Capa de dominio**: `shared/kernel` (entidades, value objects, agregados, eventos, specifications, Result, Either). Es pura lógica sin dependencias externas.
- **Capa de aplicación**: Los casos de uso (aún no implementados) orquestarán el dominio usando el patrón Result/Either.
- **Capa de infraestructura**: `config`, `middleware`, `logger`, `container`, `server`. Express es un detalle de infraestructura.
- **Capa de presentación**: Controladores y DTOs (en `modules/*`). Express maneja HTTP, pero los controladores son delgados.
- **Inyección de dependencias** con Tsyringe invierte el control, permitiendo cambiar implementaciones (por ejemplo, repositorios en memoria vs. reales) sin tocar el dominio.

Todo esto emula la filosofía **Spring Boot**: convención sobre configuración, inyección automática, módulos autocontenidos, documentación automática con Swagger, y una estructura que escala.

Con esta explicación detallada, tienes el mapa completo para navegar el proyecto y comenzar a añadir el **Employee Module** con plena comprensión de cada pieza. Si quieres avanzar con ese módulo, estaré encantado de construirlo paso a paso.
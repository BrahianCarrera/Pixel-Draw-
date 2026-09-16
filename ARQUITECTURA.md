# Arquitectura del Backend de PixelDraw 🎨

Guía teórica y práctica sobre la arquitectura en capas (**Layered Architecture / Separation of Concerns**) implementada en el backend de **PixelDraw**.

---

## 📑 Tabla de Contenidos
1. [Filosofía Arquitectónica](#1-filosofía-arquitectónica)
2. [El Ciclo de Vida de una Petición HTTP](#2-el-ciclo-de-vida-de-una-petición-http)
3. [Desglose Detallado Capa por Capa](#3-desglose-detallado-capa-por-capa)
   - [3.1 Capa de Configuración y Entrada (`main.ts`, `app.ts`)](#31-capa-de-configuración-y-entrada-maints-appts)
   - [3.2 Capa de Enrutamiento (`src/routes/`)](#32-capa-de-enrutamiento-srcroutes)
   - [3.3 Capa de Middlewares (`src/middlewares/`)](#33-capa-de-middlewares-srcmiddlewares)
   - [3.4 Capa de Esquemas y Validación (`src/schemas/`)](#34-capa-de-esquemas-y-validación-srcschemas)
   - [3.5 Capa de Controladores (`src/controllers/`)](#35-capa-de-controladores-srccontrollers)
   - [3.6 Capa de Servicios y Reglas de Negocio (`src/services/`)](#36-capa-de-servicios-y-reglas-de-negocio-srcservices)
   - [3.7 Capa de Persistencia y Modelos (`prisma/`)](#37-capa-de-persistencia-y-modelos-prisma)
4. [Manejo Centralizado de Errores (`AppError`)](#4-manejo-centralizado-de-errores-apperror)
5. [Paso a Paso de una Petición Real: `POST /api/v1/artworks`](#5-paso-a-paso-de-una-petición-real-post-apiv1artworks)
6. [Inventario Completo de Endpoints del Sistema](#6-inventario-completo-de-endpoints-del-sistema)
7. [Buenas Prácticas y Errores Comunes (Code Smells)](#7-buenas-prácticas-y-errores-comunes-code-smells)

---

## 1. Filosofía Arquitectónica

El backend de PixelDraw está diseñado bajo el patrón **Arquitectura en Capas (Layered Architecture)** y el principio de **Separación de Responsabilidades (Single Responsibility Principle - SRP)**.

### ¿Por qué no colocar todo en un solo archivo o función?
En proyectos pequeños es común ver rutas de Express donde la misma función valida el body, consulta la base de datos con SQL, aplica reglas de negocio y envía la respuesta. Aunque parece rápido, tiene serios problemas:
- **Imposible de testear en aislamiento**: Para probar si un cálculo o validación funciona, tendrías que levantar el servidor HTTP y simular peticiones de red completas.
- **Acoplamiento al framework HTTP**: Si mañana quieres usar WebSockets, tareas programadas (CRON jobs) o comandos CLI, no puedes reutilizar tu lógica porque está atada a los objetos `req` y `res` de Express.
- **Duplicación de código**: Reglas como "verificar que un usuario pertenece a una pareja" terminarían copiadas y pegadas en 10 endpoints distintos.

### La Solución: Capas con Fronteras Claras
Cada capa tiene **una única responsabilidad** y solo se comunica con su capa inmediatamente inferior:

```
[ Cliente HTTP (App Móvil / Web) ]
                │
                ▼
      ┌──────────────────┐
      │     app.ts       │  Configuración global, CORS, JSON parser
      └─────────┬────────┘
                │
                ▼
      ┌──────────────────┐
      │     Routes       │  URLs, Métodos HTTP (GET, POST...) y Middlewares
      └─────────┬────────┘
                │
                ▼
      ┌──────────────────┐
      │   Middlewares    │  Validación (Zod), Autenticación (JWT), Logging
      └─────────┬────────┘
                │
                ▼
      ┌──────────────────┐
      │   Controllers    │  Transporte HTTP: Extrae params/body y responde status/JSON
      └─────────┬────────┘
                │
                ▼
      ┌──────────────────┐
      │     Services     │  LÓGICA PURA DE NEGOCIO (No sabe qué es Express ni req/res)
      └─────────┬────────┘
                │
                ▼
      ┌──────────────────┐
      │ Prisma ORM / DB  │  Base de Datos Relacional (PostgreSQL / SQLite)
      └──────────────────┘
```

---

## 2. El Ciclo de Vida de una Petición HTTP

Cuando la aplicación móvil envía una solicitud (por ejemplo, guardar un dibujo):

1. **Recepción en `app.ts`**: Pasa por los middlewares globales (CORS, `express.json()`).
2. **Despacho en `routes/`**: Express encuentra el prefijo `/api/v1/artworks` y delega a `artwork.routes.ts`.
3. **Interceptores (Middlewares)**:
   - El middleware `validate({ body: createArtworkSchema })` inspecciona `req.body` con Zod. Si falta un campo o el formato es incorrecto, **corta la petición inmediatamente** y retorna un `400 Bad Request` antes de tocar la base de datos.
4. **Controlador (`artwork.controller.ts`)**: Recibe la petición ya limpia y validada. Extrae los datos y llama al servicio.
5. **Servicio (`artwork.service.ts`)**: Ejecuta las reglas de negocio (ej. "¿Existe la pareja?", "¿El usuario pertenece a esa pareja?"). Si algo falla, lanza un `AppError`. Si todo es correcto, ejecuta `prisma.artwork.create(...)`.
6. **Retorno al Controlador**: El servicio devuelve el objeto creado. El controlador ejecuta `sendCreated(res, artwork)` retornando código `201 Created`.
7. **Si ocurre un error**: El bloque `try/catch` del controlador captura la excepción y la pasa a `next(error)`, donde `errorHandler.ts` la formatea y envía al cliente con el código HTTP correspondiente.

---

## 3. Desglose Detallado Capa por Capa

### 3.1 Capa de Configuración y Entrada (`main.ts`, `app.ts`)
- **`main.ts`**: Punto de entrada de Node.js. Lee variables de entorno (`PORT`, `HOST`), levanta el servidor HTTP con `app.listen()` y gestiona el apagado ordenado (graceful shutdown) cerrando la conexión de Prisma.
- **`app.ts`**: Fábrica de la aplicación (`createApp()`). Registra:
  - Parseador JSON (`express.json()`).
  - Configuración de cabeceras CORS.
  - El enrutador central `/api/v1`.
  - Middleware de ruta no encontrada (`notFound`).
  - Middleware capturador global de errores (`errorHandler`).

---

### 3.2 Capa de Enrutamiento (`src/routes/`)
**Responsabilidad**: Mapear URLs y métodos HTTP hacia funciones controladoras, encadenando los middlewares necesarios.

**Regla de oro**: Las rutas **no deben contener lógica de negocio**. Solo definen la ruta, qué middlewares protegen o validan esa ruta, y qué controlador la atiende.

**Ejemplo real (`src/routes/artwork.routes.ts`)**:
```typescript
import { Router } from 'express';
import { createArtwork, getCoupleArtworks } from '../controllers/artwork.controller.js';
import { validate } from '../middlewares/validate.js';
import { createArtworkSchema, coupleParamSchema } from '../schemas/artwork.schema.js';

const router = Router();

// POST /api/v1/artworks
router.post(
  '/',
  validate({ body: createArtworkSchema }), // Middleware de validación
  createArtwork                            // Controlador
);

// GET /api/v1/artworks/couple/:coupleId
router.get(
  '/couple/:coupleId',
  validate({ params: coupleParamSchema }),
  getCoupleArtworks
);

export default router;
```

---

### 3.3 Capa de Middlewares (`src/middlewares/`)
**Responsabilidad**: Interceptar la petición antes de que llegue al controlador, o procesar la respuesta después de que ocurra un error.

En PixelDraw existen 4 middlewares clave:
1. **`validate.ts`**: Valida automáticamente `req.body`, `req.query` o `req.params` contra un esquema Zod. Transforma tipos (ej. strings de la URL a números) y detiene peticiones inválidas arrojando errores detallados campo por campo.
2. **`auth.middleware.ts`**: Verifica el token JWT en la cabecera `Authorization: Bearer <token>`, decodifica el `userId` y lo inyecta en `req.userId`. Si no hay token o expiró, retorna `401 Unauthorized`.
3. **`notFound.ts`**: Captura cualquier ruta que no coincida con los endpoints definidos y responde un `404 Not Found` en formato JSON consistente.
4. **`errorHandler.ts`**: El último middleware de la cadena. Captura cualquier error pasado por `next(err)`:
   - Si es un `AppError`, devuelve el código exacto (`400`, `401`, `403`, `404`, etc.).
   - Si es un error de clave única de Prisma (`P2002`), devuelve `409 Conflict`.
   - Si es un error inesperado, loguea la traza y responde `500 Internal Server Error`.

---

### 3.4 Capa de Esquemas y Validación (`src/schemas/`)
**Responsabilidad**: Definir la estructura, tipos y restricciones de los datos entrantes mediante **Zod**, derivando automáticamente los tipos estáticos de TypeScript.

**Ejemplo real (`src/schemas/artwork.schema.ts`)**:
```typescript
import { z } from 'zod';

export const createArtworkSchema = z.object({
  name: z.string().trim().max(100).optional(),
  width: z.number().int().min(4).max(64).default(16),
  height: z.number().int().min(4).max(64).default(16),
  grid: z.array(z.array(z.string())), // Matriz 2D de colores hex
  coupleId: z.number().int().positive(),
  authorId: z.number().int().positive(),
});

// Inferencia de tipos estáticos TypeScript automática:
export type CreateArtworkInput = z.infer<typeof createArtworkSchema>;
```
> **Ventaja**: Evitas tener que escribir la interfaz de TypeScript y luego la función de validación por separado. Zod genera ambas cosas a partir de una única fuente de la verdad.

---

### 3.5 Capa de Controladores (`src/controllers/`)
**Responsabilidad**: Gestionar el protocolo HTTP. Es el puente o traductor entre el mundo HTTP (Express) y la lógica pura de negocio (Servicios).

**Qué SÍ hace un Controlador**:
- Lee los datos validados de `req.body`, `req.params`, `req.query`.
- Llama a los métodos del Servicio pasándole parámetros primitivos o DTOs limpios.
- Envía la respuesta HTTP con el código adecuado (`200 OK`, `201 Created`, etc.) usando utilidades como `sendSuccess` o `sendCreated`.
- Envuelve su ejecución en `try / catch` y pasa cualquier error a `next(error)`.

**Qué NO debe hacer NUNCA un Controlador**:
- ❌ No hace consultas directas a Prisma (`prisma.user.findMany(...)`).
- ❌ No contiene lógica de negocio compleja (ej. "¿Esta contraseña coincide con el hash?", "¿La pareja ya tiene 2 integrantes?").
- ❌ No manipula transacciones de base de datos.

**Ejemplo real (`src/controllers/artwork.controller.ts`)**:
```typescript
export const createArtwork = async (
  req: Request<{}, {}, CreateArtworkInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Llama al servicio (el controlador no sabe cómo se guarda en la base de datos)
    const artwork = await artworkService.createArtwork(req.body);

    // 2. Responde al cliente con formato estándar
    sendCreated(res, artwork, 'Dibujo compartido con éxito a tu pareja');
  } catch (error) {
    // 3. Pasa el error al middleware global
    next(error);
  }
};
```

---

### 3.6 Capa de Servicios y Reglas de Negocio (`src/services/`)
**Responsabilidad**: El corazón de la aplicación. Aquí reside toda la lógica de dominio, cálculos, validaciones de negocio y llamadas a la base de datos.

**Propiedades de un buen Servicio**:
- **Desacoplado de Express**: Los métodos de un servicio **nunca reciben `req` ni `res`**. Reciben argumentos simples (`id: number, data: CreateArtworkInput`) y retornan promesas con datos (`Promise<ArtworkWithAuthor>`).
- **Lanza errores de dominio**: Si una regla falla, el servicio arroja excepciones semánticas: `throw AppError.forbidden('No perteneces a esta pareja')` o `throw AppError.notFound('Pareja no encontrada')`.
- **Orquesta múltiples modelos**: Si una acción requiere actualizar dos tablas simultáneamente, el servicio maneja la transacción (`prisma.$transaction`).

**Ejemplo real (`src/services/artwork.service.ts`)**:
```typescript
export class ArtworkService {
  async createArtwork(data: CreateArtworkInput): Promise<ArtworkWithAuthor> {
    // 1. Regla de negocio: ¿Existe el autor?
    const author = await prisma.user.findUnique({ where: { id: data.authorId } });
    if (!author) {
      throw AppError.notFound(`Usuario autor '${data.authorId}' no encontrado`);
    }

    // 2. Regla de negocio: ¿El autor realmente pertenece a la pareja indicada?
    if (!author.coupleId || author.coupleId !== data.coupleId) {
      throw AppError.forbidden('El autor debe ser miembro de la pareja para publicar un dibujo');
    }

    // 3. Regla de negocio: ¿Existe la pareja?
    const couple = await prisma.couple.findUnique({ where: { id: data.coupleId } });
    if (!couple) {
      throw AppError.notFound(`Pareja '${data.coupleId}' no encontrada`);
    }

    // 4. Persistencia en la base de datos
    const artwork = await prisma.artwork.create({
      data: {
        name: data.name ?? null,
        width: data.width,
        height: data.height,
        grid: data.grid as object,
        coupleId: data.coupleId,
        authorId: data.authorId,
      },
      include: {
        author: { select: this.authorSelect },
      },
    });

    return artwork as ArtworkWithAuthor;
  }
}

export const artworkService = new ArtworkService();
```

---

### 3.7 Capa de Persistencia y Modelos (`prisma/`)
**Responsabilidad**: Administrar el esquema de la base de datos, tipos de columnas, índices, relaciones y migraciones.

En PixelDraw encontramos tres entidades relacionales principales:
- **`User`**: Cuenta de usuario, credenciales (hash bcrypt), pertenencia opcional a una `Couple`.
- **`Couple`**: Vínculo entre dos usuarios, código único de invitación (`inviteCode`).
- **`Artwork`**: Dibujo de pixel art en formato JSON (`grid: string[][]`), vinculado a una `Couple` y con un `User` autor.

---

## 4. Manejo Centralizado de Errores (`AppError`)

En lugar de devolver manualmente `res.status(404).json(...)` disperso por todo el código, se utiliza la clase personalizada `AppError`:

```typescript
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode = 400, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Error controlado por nosotros (no un bug inesperado)
    this.details = details;
  }

  static badRequest(message: string, details?: any) { return new AppError(message, 400, details); }
  static unauthorized(message = 'No autorizado') { return new AppError(message, 401); }
  static forbidden(message = 'Acceso denegado') { return new AppError(message, 403); }
  static notFound(message = 'Recurso no encontrado') { return new AppError(message, 404); }
}
```

### Formato de Respuesta Estándar
Cualquier error en la API produce una respuesta uniforme:
```json
{
  "success": false,
  "message": "El autor debe ser miembro de la pareja para publicar un dibujo",
  "details": null
}
```
Y si es un error de validación Zod:
```json
{
  "success": false,
  "message": "Error de validación en los datos enviados",
  "details": [
    { "field": "width", "message": "Number must be less than or equal to 64" }
  ]
}
```

---

## 5. Paso a Paso de una Petición Real: `POST /api/v1/artworks`

Veamos cómo viaja un paquete de red desde el celular hasta la base de datos:

```
[Cliente Móvil]
   │  POST /api/v1/artworks
   │  Headers: { Content-Type: "application/json", Authorization: "Bearer ..." }
   │  Body: { name: "Corazón", width: 16, height: 16, grid: [...], coupleId: 3, authorId: 1 }
   ▼
[app.ts]
   │  1. express.json() parsea el texto a objeto JS.
   │  2. Aplica cabeceras de CORS.
   ▼
[routes/index.ts -> routes/artwork.routes.ts]
   │  Coincide con router.post('/')
   ▼
[middlewares/validate.ts]
   │  Ejecuta createArtworkSchema.parseAsync(req.body).
   │  ¿Es válido? SÍ -> Inyecta req.body saneado y llama a next().
   ▼
[controllers/artwork.controller.ts: createArtwork]
   │  Recibe req.body validado.
   │  Ejecuta: await artworkService.createArtwork(req.body)
   ▼
[services/artwork.service.ts: createArtwork]
   │  1. prisma.user.findUnique(1) -> ¿Existe el autor?
   │  2. author.coupleId === 3 -> ¿Pertenece a la pareja?
   │  3. prisma.artwork.create(...) -> Inserta fila en tabla 'artworks'.
   │  4. Retorna el nuevo registro con los datos del autor incluidos.
   ▼
[controllers/artwork.controller.ts]
   │  Llama a sendCreated(res, artwork, 'Dibujo compartido con éxito')
   ▼
[Cliente Móvil]
   HTTP/1.1 201 Created
   {
     "success": true,
     "message": "Dibujo compartido con éxito a tu pareja",
     "data": { "id": 42, "name": "Corazón", "grid": [...], "createdAt": "..." }
   }
```

---

## 6. Inventario Completo de Endpoints del Sistema

### 🩺 Salud del Servidor (`/api/v1/health`)
| Método | Endpoint | Middleware | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/health` | Ninguno | Estado de la API, uptime y fecha actual |

### 🔐 Autenticación (`/api/v1/auth`)
| Método | Endpoint | Middleware | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | `validate(registerSchema)` | Crea nuevo usuario y retorna token JWT |
| `POST` | `/api/v1/auth/login` | `validate(loginSchema)` | Inicia sesión con email/usuario y password |
| `GET` | `/api/v1/auth/me` | `requireAuth` | Obtiene el perfil del usuario autenticado y su pareja |

### 👤 Usuarios (`/api/v1/users`)
| Método | Endpoint | Middleware | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/users/:id` | `validate(userIdParam)` | Consulta información pública de un usuario |
| `PATCH` | `/api/v1/users/:id` | `validate(updateUserSchema)` | Actualiza nombre de usuario o email |

### 💑 Parejas (`/api/v1/couples`)
| Método | Endpoint | Middleware | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/couples` | `validate(createCoupleSchema)` | Crea una nueva pareja y genera un código de invitación |
| `POST` | `/api/v1/couples/join` | `validate(joinCoupleSchema)` | Se vincula a una pareja mediante su código de invitación |
| `GET` | `/api/v1/couples/:id` | `validate(coupleIdParam)` | Obtiene los detalles de la pareja y sus miembros |
| `GET` | `/api/v1/couples/user/:userId` | `validate(userParam)` | Obtiene la pareja asociada a un usuario |
| `POST` | `/api/v1/couples/:id/regenerate-code` | `validate(coupleIdParam)` | Regenera un nuevo código de invitación aleatorio |

### 🎨 Dibujos / Artworks (`/api/v1/artworks`)
| Método | Endpoint | Middleware | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/artworks` | `validate(createArtworkSchema)` | Guarda y envía un nuevo dibujo de pixel art a la pareja |
| `GET` | `/api/v1/artworks/couple/:coupleId` | `validate(coupleParam, querySchema)` | Galería paginada de dibujos de la pareja (`page`, `limit`) |
| `GET` | `/api/v1/artworks/couple/:coupleId/latest` | `validate(coupleParam)` | **Último dibujo activo** (ideal para Widgets de inicio y Home) |
| `GET` | `/api/v1/artworks/:id` | `validate(artworkIdParam)` | Detalle de un dibujo específico |
| `PATCH` | `/api/v1/artworks/:id` | `validate(updateArtworkSchema)` | Actualiza título o cuadrícula del dibujo |
| `DELETE` | `/api/v1/artworks/:id` | `validate(artworkIdParam)` | Elimina un dibujo |

### ⚡ Sincronización Global Eficiente (`/api/v1/sync`)
| Método | Endpoint | Middleware | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/sync` | `requireAuth` | **Endpoint Todo-en-Uno**: Retorna en un solo viaje HTTP el usuario, su pareja activa y el último dibujo. Evita saturar la base de datos con consultas separadas al entrar a la app o widgets |

---

## 7. Buenas Prácticas y Errores Comunes (Code Smells)

| Práctica / Smell | ¿Por qué evitarlo? / Solución |
|---|---|
| ❌ **Fat Controller** (Controlador gordo) | Escribir 100 líneas de lógica en el controlador dificulta testear. El controlador debe ser delgado (~10-15 líneas por método). |
| ❌ **Pasar `req` o `res` al Servicio** | Si le pasas `req` al servicio, no podrás llamarlo desde un worker o un script CLI. Pásale solo datos limpios: `service.doSomething(id, data)`. |
| ❌ **No validar antes de consultar** | Dejar que datos mal formados lleguen a la base de datos genera errores crípticos de SQL. Usa Zod en el middleware de entrada. |
| ❌ **Try/Catch vacíos o swallowing errors** | Nunca hagas `catch (e) {}` silencioso. Siempre lanza `AppError` o delega a `next(error)`. |
| ✅ **Respuestas Uniformes** | Todas las respuestas exitosas usan `{ success: true, data, message }` y los errores `{ success: false, message, details }`. La app cliente siempre sabe qué estructura esperar. |
| ✅ **Consultas atómicas con Prisma** | Si una operación requiere tocar múltiples tablas o crear registros relacionados, usa `prisma.$transaction` o `include` anidados para garantizar consistencia. |

---

*Documentación generada para el equipo de desarrollo de PixelDraw.*

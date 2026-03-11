# Sync User Service

API en Node.js y TypeScript para sincronizar usuarios en PostgreSQL.

## Requisitos

- Node.js 20 o superior
- Docker y Docker Compose

## Variables de entorno

El servicio necesita estas variables:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sync_service_db
DB_USER=postgres
DB_PASSWORD=postgres
```

Antes de arrancar el servicio, copia `.env.example` a `.env`.

Ejemplo en PowerShell:

```powershell
Copy-Item .env.example .env
```

## Instalacion

```powershell
npm install
```

## Arranque en local

1. Crea el archivo de entorno:

```powershell
Copy-Item .env.example .env
```

2. Instala dependencias:

```powershell
npm install
```

3. Levanta PostgreSQL:

```powershell
docker compose up -d postgres
```

4. Arranca la API:

```powershell
npm run dev
```

5. Comprueba el estado del servicio:

```powershell
curl http://127.0.0.1:3000/health
```

Respuesta esperada:

```json
{"status":"ok","database":"up"}
```

## Scripts

```powershell
npm run dev
npm run build
npm run start
npm test
```

- `dev`: ejecuta la API en modo watch
- `build`: compila TypeScript en `dist/`
- `start`: arranca la version compilada
- `test`: compila el proyecto y ejecuta los tests basicos

## Tests

El proyecto incluye tests basicos para:

- `GET /health` cuando la base de datos esta disponible
- `GET /health` cuando la base de datos no esta disponible
- `POST /sync/user` con payload invalido

Ejecucion:

```powershell
npm test
```

## Arquitectura

El proyecto sigue una estructura simple separando responsabilidades:

```text
src
|-- controllers   # manejo de requests/responses
|-- services      # logica de negocio
|-- routes        # definicion de endpoints
|-- schemas       # validacion de payloads (Zod)
|-- middlewares   # middleware (correlation id, etc.)
|-- db            # conexion e inicializacion de PostgreSQL
|-- types         # extensiones de tipos de Express
|-- app.ts        # configuracion de Express
`-- server.ts     # arranque del servidor
```

## Docker

Para levantar base de datos y API desde un repositorio recien clonado:

1. Crea el archivo de entorno:

```powershell
Copy-Item .env.example .env
```

2. Levanta los servicios:

```powershell
docker compose up --build
```

Servicios definidos:

- `postgres`: PostgreSQL 16 con volumen persistente
- `app`: API expuesta en `http://localhost:3000`

## Endpoints

### `GET /health`

Verifica que la API responde y que la conexion con PostgreSQL esta activa.

```powershell
curl http://127.0.0.1:3000/health
```

### `POST /sync/user`

Crea o actualiza un usuario usando la combinacion `(credential, email)`.

Body:

```json
{
  "credential": "EMP-2026-0142",
  "email": "adrian@sanchez.com",
  "name": "Adrian Sanchez"
}
```

Ejemplo:

```powershell
curl -X POST http://127.0.0.1:3000/sync/user ^
  -H "Content-Type: application/json" ^
  -d "{\"credential\":\"EMP-2026-0142\",\"email\":\"adrian@sanchez.com\",\"name\":\"Adrian Sanchez\"}"
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "credential": "EMP-2026-0142",
    "email": "adrian@sanchez.com",
    "name": "Adrian Sanchez",
    "created_at": "2026-03-10T22:19:56.916Z",
    "updated_at": "2026-03-10T22:19:56.916Z"
  },
  "correlationId": "c7f3d72f-57f5-4b84-9b2c-5d17bce3be52"
}
```

## Manejo de errores

- `400`: payload invalido
- `409`: conflicto de datos
- `500`: error interno del servidor

## Notas

- La tabla `users` se crea al arrancar el servicio.
- Cada peticion incluye `x-correlation-id` en request y response.

# API Documentation - Conozca

## 📚 Documentación Interactiva

La API cuenta con documentación interactiva generada automáticamente con Swagger/OpenAPI.

**Recursos rápidos:**
- Swagger UI: http://localhost:4000/api/docs
- Colección Postman: postman/ConozcaAPI.postman_collection.json
- Environment Postman (local): postman/ConozcaAPI.postman_environment.json
- Environment Postman (staging): postman/ConozcaAPI.postman_environment.staging.json
- Environment Postman (prod): postman/ConozcaAPI.postman_environment.production.json

### Acceder a la Documentación

**Desarrollo:**
```
http://localhost:3000/api/docs
```

**Staging:**
```
https://staging-api.conozca.org/api/docs
```

**Producción:**
```
https://api.conozca.org/api/docs
```

### Configuración

La documentación Swagger está habilitada por defecto en desarrollo. Para producción, configurar:

```env
ENABLE_SWAGGER=true
```

## 🔐 Autenticación

Todos los endpoints protegidos requieren un token JWT en el header:

```http
Authorization: Bearer <access_token>
```

### Obtener un Token

1. **Registrarse:**
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Juan Pérez"
}
```

2. **Iniciar sesión:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Respuesta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "Juan Pérez",
    "role": "USER"
  }
}
```

3. **Refrescar token:**
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Tokens

- **Access Token**: Válido por 15 minutos
- **Refresh Token**: Válido por 7 días

## 📝 Endpoints Principales

### Autenticación (`/auth`)

| Método | Endpoint | Descripción | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/auth/register` | Registrar nuevo usuario | 3/min |
| POST | `/auth/login` | Iniciar sesión | 5/min |
| POST | `/auth/refresh` | Refrescar access token | - |
| POST | `/auth/logout` | Cerrar sesión | - |
| POST | `/auth/forgot-password` | Solicitar reset de contraseña | 2/min |
| POST | `/auth/reset-password` | Resetear contraseña | - |

### Artículos (`/articles`)

| Método | Endpoint | Descripción | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| GET | `/articles` | Listar artículos | Opcional | - |
| GET | `/articles/:slugOrId` | Obtener artículo | Opcional | - |
| POST | `/articles` | Crear artículo | Requerida (EDITOR/ADMIN) | 10/hora |
| PATCH | `/articles/:id` | Actualizar artículo | Requerida | - |
| DELETE | `/articles/:id` | Eliminar artículo | Requerida (ADMIN) | - |
| GET | `/articles/:id/full` | Artículo con bloques | Opcional | - |
| GET | `/articles/:id/pdf` | Descargar PDF | - | - |

### Categorías (`/articles/categories`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/articles/categories` | Listar categorías | No |
| POST | `/articles/categories` | Crear categoría | Requerida (ADMIN) |

### Autores (`/articles/authors`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/articles/authors` | Listar autores | No |
| POST | `/articles/authors` | Crear autor | Requerida (ADMIN) |

### Bloques (`/articles/:articleId/blocks`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/articles/:articleId/blocks` | Listar bloques | Opcional |
| POST | `/articles/:articleId/blocks` | Crear bloque | Requerida (EDITOR/ADMIN) |
| GET | `/articles/:articleId/blocks/:blockId` | Obtener bloque | - |
| PATCH | `/articles/:articleId/blocks/:blockId` | Actualizar bloque | Requerida (EDITOR/ADMIN) |
| DELETE | `/articles/:articleId/blocks/:blockId` | Eliminar bloque | Requerida (EDITOR/ADMIN) |
| POST | `/articles/:articleId/blocks/reorder` | Reordenar bloques | Requerida (EDITOR/ADMIN) |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Estado del servicio |

## 🔒 Roles y Permisos

### USER (Usuario Registrado)
- Ver artículos publicados
- Ver categorías y autores
- Cerrar sesión

### EDITOR
- Todos los permisos de USER
- Crear artículos
- Editar sus propios artículos
- Crear y gestionar bloques en sus artículos
- Ver borradores propios

### ADMIN (Administrador)
- Todos los permisos de EDITOR
- Editar cualquier artículo
- Eliminar artículos
- Crear categorías
- Crear autores
- Ver todos los borradores
- Gestionar SEO de artículos

## 📊 Paginación

Los endpoints de listado soportan paginación mediante query parameters:

```
GET /articles?page=2&pageSize=20
```

**Parámetros:**
- `page`: Número de página (default: 1, min: 1)
- `pageSize`: Elementos por página (default: 10, min: 1, max: 100)

**Respuesta:**
```json
{
  "items": [...],
  "total": 150,
  "page": 2,
  "pageSize": 20,
  "totalPages": 8
}
```

## 🛡️ Rate Limiting

La API implementa rate limiting para prevenir abuso:

### Global
- **100 requests por 10 minutos** por IP

### Por Endpoint
- `POST /auth/register`: 3 requests/minuto
- `POST /auth/login`: 5 requests/minuto
- `POST /auth/forgot-password`: 2 requests/minuto
- `POST /articles`: 10 requests/hora

### Headers de Rate Limit
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642521600
```

## 🎯 Estados de Artículos

| Estado | Descripción | Visibilidad |
|--------|-------------|-------------|
| `DRAFT` | Borrador | Solo autor y ADMIN |
| `PUBLISHED` | Publicado | Público |
| `ARCHIVED` | Archivado | Solo ADMIN |

## 📦 Tipos de Bloques

Los artículos soportan bloques de contenido estructurado:

- `TEXT`: Texto plano
- `MARKDOWN`: Contenido en Markdown
- `HTML`: HTML personalizado
- `IMAGE`: Imagen con caption
- `VIDEO`: Video embebido
- `CODE`: Bloque de código con syntax highlighting
- `QUOTE`: Cita o quote destacado
- `CALLOUT`: Mensaje destacado (info, warning, error)

## 🔍 Búsqueda

**Endpoint:** `GET /articles/search?q=typescript`

Busca en:
- Títulos de artículos
- Contenido
- Extractos
- Nombres de autores
- Nombres de categorías

## 📄 SEO

Cada artículo puede tener metadata SEO personalizada:

```json
{
  "metaTitle": "Guía TypeScript 2024",
  "metaDescription": "Aprende TypeScript desde cero...",
  "keywords": ["typescript", "javascript", "programación"],
  "ogImage": "https://cdn.conozca.org/images/typescript.jpg"
}
```

## 🚀 Ejemplos con cURL

### Crear un Artículo

```bash
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Mi Primer Artículo",
    "slug": "mi-primer-articulo",
    "content": "Contenido del artículo...",
    "excerpt": "Resumen corto",
    "authorId": "123e4567-e89b-12d3-a456-426614174000",
    "categoryId": "123e4567-e89b-12d3-a456-426614174001",
    "status": "DRAFT"
  }'
```

### Listar Artículos

```bash
curl http://localhost:3000/articles?page=1&pageSize=10
```

### Obtener un Artículo

```bash
curl http://localhost:3000/articles/mi-primer-articulo
```

## 📚 Ejemplos con JavaScript/TypeScript

### Usando Fetch

```typescript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'SecurePass123!'
    })
  });
  const data = await response.json();
  return data.access_token;
};

// Crear artículo
const createArticle = async (token: string) => {
  const response = await fetch('http://localhost:3000/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Mi Artículo',
      slug: 'mi-articulo',
      content: 'Contenido...',
      authorId: '...',
      categoryId: '...'
    })
  });
  return response.json();
};
```

### Usando Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Uso
const articles = await api.get('/articles', {
  params: { page: 1, pageSize: 10 }
});
```

## 🔄 Webhooks (Próximamente)

La API soportará webhooks para notificar eventos:

- `article.created`
- `article.published`
- `article.updated`
- `article.deleted`

## 📞 Soporte

Para reportar problemas o sugerencias:
- GitHub Issues: https://github.com/conozca/conozca-monorepo/issues
- Email: soporte@conozca.org

## 📜 Licencia

Ver [LICENSE](../LICENSE) para más información.

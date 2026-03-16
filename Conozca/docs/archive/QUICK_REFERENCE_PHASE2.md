# 🚀 Quick Reference - Fase 2 Endpoints

## Autenticación Primero (Fase 1)

### Registrarse
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "name": "John Doe"
  }'
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

---

## Artículos - Fase 2

### 1. Crear Artículo (solo EDITOR/ADMIN)

```bash
curl -X POST http://localhost:4000/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Article",
    "slug": "my-first-article",
    "content": "This is the article content...",
    "excerpt": "A brief summary",
    "featuredImage": "https://example.com/image.jpg",
    "status": "DRAFT",
    "authorId": "author-uuid",
    "categoryId": "category-uuid"
  }'
```

**Estados válidos:**
- `DRAFT` - Borrador (solo visible para creador)
- `PUBLISHED` - Publicado (visible para todos)
- `ARCHIVED` - Archivado (oculto)

### 2. Listar Artículos

```bash
# Todos (público)
curl http://localhost:4000/articles

# Con paginación
curl "http://localhost:4000/articles?page=2&pageSize=5"

# Como usuario autenticado (ve borradores propios)
curl http://localhost:4000/articles \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**
```json
{
  "items": [
    {
      "id": "article-uuid",
      "title": "Article Title",
      "slug": "article-slug",
      "content": "...",
      "excerpt": "...",
      "status": "PUBLISHED",
      "author": {
        "id": "author-id",
        "name": "Author Name",
        "bio": "...",
        "avatarUrl": "..."
      },
      "category": {
        "id": "cat-id",
        "name": "Technology",
        "slug": "technology"
      },
      "viewCount": 42,
      "createdAt": "2024-01-15T10:00:00Z",
      "publishedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

### 3. Obtener Artículo por Slug

```bash
# Por slug
curl http://localhost:4000/articles/my-first-article

# Por ID (UUID)
curl http://localhost:4000/articles/a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6

# Con autenticación (registra vista del usuario)
curl http://localhost:4000/articles/my-first-article \
  -H "Authorization: Bearer $TOKEN"
```

**Nota:** Automáticamente registra una visualización si es publicado

### 4. Actualizar Artículo (solo propietario/ADMIN)

```bash
curl -X PATCH http://localhost:4000/articles/article-uuid \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "status": "PUBLISHED"
  }'
```

**Campos disponibles para actualizar:**
- `title`
- `slug`
- `content`
- `excerpt`
- `featuredImage`
- `status`
- `authorId`
- `categoryId`

### 5. Eliminar Artículo (solo propietario/ADMIN)

```bash
curl -X DELETE http://localhost:4000/articles/article-uuid \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:** HTTP 204 No Content

---

## Categorías - Fase 2

### 1. Crear Categoría (solo ADMIN)

```bash
curl -X POST http://localhost:4000/articles/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Technology",
    "slug": "technology",
    "description": "Technology and innovation articles"
  }'
```

### 2. Listar Categorías

```bash
curl http://localhost:4000/articles/categories
```

**Respuesta:**
```json
[
  {
    "id": "category-uuid",
    "name": "Technology",
    "slug": "technology",
    "description": "...",
    "_count": {
      "articles": 5
    }
  }
]
```

---

## Autores - Fase 2

### 1. Crear Autor (solo ADMIN)

```bash
curl -X POST http://localhost:4000/articles/authors \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "bio": "Tech writer and developer",
    "avatarUrl": "https://example.com/john.jpg"
  }'
```

### 2. Listar Autores

```bash
curl http://localhost:4000/articles/authors
```

**Respuesta:**
```json
[
  {
    "id": "author-uuid",
    "name": "John Doe",
    "bio": "Tech writer and developer",
    "avatarUrl": "...",
    "_count": {
      "articles": 12
    }
  }
]
```

---

## Control de Acceso

### Qué puede hacer cada rol:

#### USER
```
✅ Ver artículos publicados
✅ Listar artículos con paginación
✅ Obtener artículo individual (registra vista)
✅ Listar categorías
✅ Listar autores
❌ Crear artículos
❌ Editar artículos
❌ Eliminar artículos
❌ Ver borradores
```

#### EDITOR
```
✅ Todo lo del USER
✅ Crear artículos (como borrador)
✅ Editar propios artículos
✅ Eliminar propios artículos
✅ Ver borradores propios
✅ Cambiar estado a PUBLISHED
❌ Editar artículos de otros
❌ Crear categorías/autores
```

#### ADMIN
```
✅ Todo lo del EDITOR
✅ Editar/eliminar cualquier artículo
✅ Crear categorías
✅ Crear autores
✅ Acceso total al sistema
```

---

## Ejemplos de Flujos Completos

### Flujo 1: Crear y Publicar Artículo

```bash
# 1. Registrarse como EDITOR
TOKEN=$(curl -s -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"editor@test.com","password":"Pass123!","name":"Editor"}' \
  | jq -r '.access_token')

# 2. Convertir a EDITOR manualmente en BD
# (Necesita ADMIN hacer esto en producción)

# 3. Crear categoría como ADMIN
CATEGORY_ID=$(curl -s -X POST http://localhost:4000/articles/categories \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tech","slug":"tech","description":"Tech"}' \
  | jq -r '.id')

# 4. Crear autor como ADMIN
AUTHOR_ID=$(curl -s -X POST http://localhost:4000/articles/authors \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","bio":"...","avatarUrl":"..."}' \
  | jq -r '.id')

# 5. Crear artículo como DRAFT
ARTICLE_ID=$(curl -s -X POST http://localhost:4000/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"My Article\",\"slug\":\"my-article\",\"content\":\"...\",\"excerpt\":\"...\",\"featuredImage\":\"...\",\"status\":\"DRAFT\",\"authorId\":\"$AUTHOR_ID\",\"categoryId\":\"$CATEGORY_ID\"}" \
  | jq -r '.id')

# 6. Publicar artículo
curl -X PATCH http://localhost:4000/articles/$ARTICLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"PUBLISHED"}'

# 7. Ver artículo publicado (registra vista)
curl http://localhost:4000/articles/my-article

# 8. Actualizar artículo
curl -X PATCH http://localhost:4000/articles/$ARTICLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'
```

### Flujo 2: Leer Artículos como Usuario

```bash
# 1. Listar artículos publicados (sin auth)
curl "http://localhost:4000/articles?page=1&pageSize=10"

# 2. Obtener artículo específico (registra vista)
curl http://localhost:4000/articles/my-article

# 3. Ver contador de vistas
curl http://localhost:4000/articles/my-article | jq '.viewCount'

# 4. Listar categorías
curl http://localhost:4000/articles/categories

# 5. Listar autores
curl http://localhost:4000/articles/authors
```

---

## Variables Útiles

### Guardar token en variable
```bash
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123!"}' \
  | jq -r '.access_token')

echo "Token: $TOKEN"
```

### Usar en headers
```bash
curl http://localhost:4000/articles \
  -H "Authorization: Bearer $TOKEN"
```

### Parsear respuesta
```bash
# Obtener ID
ID=$(curl -s ... | jq -r '.id')

# Obtener array
ITEMS=$(curl -s ... | jq '.items')

# Contar items
curl -s ... | jq '.items | length'
```

---

## Códigos HTTP Esperados

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| 200 | OK | GET, PATCH exitoso |
| 201 | Created | POST exitoso |
| 204 | No Content | DELETE exitoso |
| 400 | Bad Request | Slug duplicado |
| 401 | Unauthorized | Sin token |
| 403 | Forbidden | Permisos insuficientes |
| 404 | Not Found | Artículo no existe |
| 422 | Unprocessable | DTO inválido |

---

## Errores Comunes

### Error 400 - Slug duplicado
```json
{
  "message": "El slug del artículo ya existe",
  "error": "Bad Request",
  "statusCode": 400
}
```
**Solución:** Usa un slug diferente

### Error 401 - Sin token
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```
**Solución:** Agrega `Authorization: Bearer $TOKEN` en headers

### Error 403 - Permisos insuficientes
```json
{
  "message": "Solo administradores y editores pueden crear artículos",
  "error": "Forbidden",
  "statusCode": 403
}
```
**Solución:** Usa cuenta con rol EDITOR/ADMIN

### Error 404 - No encontrado
```json
{
  "message": "Artículo no encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```
**Solución:** Verifica el slug o ID

### Error 422 - DTO inválido
```json
{
  "message": ["title must be longer than or equal to 3 characters"],
  "error": "Unprocessable Entity",
  "statusCode": 422
}
```
**Solución:** Valida los datos según DTOs

---

## Herramientas Recomendadas

### Curl
```bash
# Instalado por defecto en macOS/Linux
curl --version
```

### jq (JSON processor)
```bash
# Instalar
brew install jq

# Uso
curl ... | jq '.access_token'
```

### Postman / Insomnia
- Interfaz gráfica
- Historial de requests
- Variables de entorno

### VS Code Rest Client
- Extensión "REST Client"
- Archivo .rest o .http
- Ejecución directa

---

## Parámetros de Query

### Paginación
```bash
?page=1        # Página (default: 1)
?pageSize=10   # Items por página (default: 10, max: 100)

# Ejemplo
curl "http://localhost:4000/articles?page=2&pageSize=5"
```

---

## Validaciones de Input

### Artículo
- `title`: min 3 caracteres
- `slug`: único, sin espacios
- `content`: requerido
- `excerpt`: requerido
- `status`: DRAFT | PUBLISHED | ARCHIVED
- `authorId`: UUID válido
- `categoryId`: UUID válido

### Categoría
- `name`: requerido, único
- `slug`: único, sin espacios
- `description`: requerido

### Autor
- `name`: requerido
- `bio`: requerido
- `avatarUrl`: URL válida

---

**Última actualización**: Fase 2 Completada
**Status**: ✅ Listo para usar


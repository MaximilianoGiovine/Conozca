# 🧪 Testing Guide - Conozca API

Guía completa para probar todos los endpoints de la API.

**Base URL:** `http://localhost:4000`

---

## 🔐 Authentication Endpoints

### 1️⃣ Register - `POST /auth/register`

Crear una nueva cuenta de usuario.

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**Errores:**
- `409 Conflict` - Email ya registrado
- `400 Bad Request` - Datos inválidos

---

### 2️⃣ Login - `POST /auth/login`

Iniciar sesión y obtener tokens.

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**Errores:**
- `401 Unauthorized` - Email o contraseña inválidos

---

### 3️⃣ Refresh Token - `POST /auth/refresh`

Renovar el access token usando el refresh token.

```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `401 Unauthorized` - Token inválido o expirado

---

### 4️⃣ Logout - `POST /auth/logout`

Cerrar sesión (elimina el token en el cliente).

```bash
curl -X POST http://localhost:4000/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

**Errores:**
- `401 Unauthorized` - Token inválido o ausente

---

### 5️⃣ Forgot Password - `POST /auth/forgot-password`

Solicitar recuperación de contraseña. Genera un token temporal y lo almacena en la BD.

```bash
curl -X POST http://localhost:4000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Response (200):**
```json
{
  "message": "Si el email existe, recibirás instrucciones para resetear tu contraseña"
}
```

> **Nota:** Por seguridad, siempre devuelve el mismo mensaje (no revela si el email existe).

---

### 6️⃣ Reset Password - `POST /auth/reset-password`

Completar la recuperación de contraseña usando el token temporal.

```bash
# Primero, obtén el reset_token de la base de datos o del email
# Prisma Studio: http://localhost:51212
# Campo: User.resetToken

curl -X POST http://localhost:4000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "reset_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "password": "NewSecurePass456!"
  }'
```

**Response (200):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores:**
- `401 Unauthorized` - Token inválido, expirado o email no coincide

---

## 🔍 Testing Workflow

### Flujo Completo de Autenticación

```bash
# 1. Register
REGISTER=$(curl -s -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }')

ACCESS_TOKEN=$(echo $REGISTER | jq -r '.access_token')
REFRESH_TOKEN=$(echo $REGISTER | jq -r '.refresh_token')

echo "✅ Register:"
echo $REGISTER | jq '.user'

# 2. Login
echo -e "\n✅ Login:"
curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }' | jq '.user'

# 3. Refresh Token
echo -e "\n✅ Refresh Token:"
NEW_TOKENS=$(curl -s -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "'$REFRESH_TOKEN'"
  }')
echo $NEW_TOKENS | jq 'keys'

# 4. Logout
echo -e "\n✅ Logout:"
curl -s -X POST http://localhost:4000/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
```

---

## 🛠️ Herramientas Recomendadas

### Prisma Studio
Ver y editar datos en la BD gráficamente:
```bash
cd packages/database
pnpm exec prisma studio
# Abre: http://localhost:51212
```

### Postman / Insomnia
Importar colección de requests:
- Crear en Postman collection "Conozca API"
- Agregar folder "Auth"
- Copiar los curl commands anteriores como requests

### VS Code REST Client
Instalar extensión REST Client y crear `test.http`:

```http
### Register
POST http://localhost:4000/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}

### Login
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

---

## ✅ Checklist de Testing

### Fase 1: Autenticación Básica
- [ ] POST /auth/register - Usuario nuevo
- [ ] POST /auth/register - Email duplicado (error 409)
- [ ] POST /auth/login - Credenciales correctas
- [ ] POST /auth/login - Credenciales incorrectas (error 401)
- [ ] POST /auth/refresh - Token válido
- [ ] POST /auth/refresh - Token expirado (error 401)
- [ ] POST /auth/logout - Token válido
- [ ] POST /auth/logout - Sin token (error 401)

### Fase 1: Recuperación de Contraseña
- [ ] POST /auth/forgot-password - Email válido
- [ ] POST /auth/forgot-password - Email inválido (sin error, por seguridad)
- [ ] POST /auth/reset-password - Token válido, contraseña nueva
- [ ] POST /auth/reset-password - Token expirado (error 401)
- [ ] POST /auth/reset-password - Token inválido (error 401)
- [ ] Login con nueva contraseña

### Próximas Fases
- [ ] Autorización por roles (ADMIN, EDITOR, USER)
- [ ] CRUD de artículos
- [ ] Búsqueda y filtrado
- [ ] Rate limiting y seguridad

---

## 📊 Variables de Ambiente

Asegurate que `.env` está configurado en `apps/api/`:

```env
DATABASE_URL="postgresql://admin:mypassword123@localhost:5432/conozca_db"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
PORT=4000
```

---

## 🚀 Iniciar Testing

```bash
# Terminal 1: Database
docker-compose up -d

# Terminal 2: API
cd apps/api
npm run dev

# Terminal 3: Tests
# Ejecutar curl commands o usar REST Client
```

---

## 📝 Notas

- Los tokens de acceso expiran en **15 minutos**
- Los tokens de refresco expiran en **7 días**
- Los tokens de reset de contraseña expiran en **1 hora**
- Las contraseñas se hashean con bcrypt (10 salt rounds)
- Todos los emails se validan como direcciones válidas


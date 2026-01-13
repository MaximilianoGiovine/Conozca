# Backend Optimizations Guide

## Resumen

Se han implementado 5 optimizaciones críticas para el backend:

1. ✅ **Winston Logger** - Logging estructurado con rotación de archivos
2. ✅ **Email Service** - Envío de emails con Nodemailer
3. ✅ **Upload Service** - Subida de imágenes (local/Cloudinary/S3)
4. ✅ **Comments System** - Sistema de comentarios con moderación
5. ✅ **Sentry Integration** - Error tracking y monitoring

---

## 1. Winston Logger

### Características

- Logging estructurado con JSON en producción
- Logging colorizado en desarrollo
- Rotación automática de archivos:
  - `error.log`: 30 días, 20MB max
  - `combined.log`: 14 días, 20MB max
- HTTP request logging con duración
- Business event tracking

### Uso

```typescript
import { LoggerService } from './common/logger.service';

class MyService {
  private logger = new LoggerService('MyService');

  someMethod() {
    this.logger.log('Operación exitosa');
    this.logger.error('Error crítico', error.stack);
    this.logger.warn('Advertencia');
    
    // Logging de negocio
    this.logger.logBusinessEvent('user_purchased', {
      userId: '123',
      amount: 99.99,
    });
    
    // Logging de queries
    this.logger.logQuery('SELECT * FROM users WHERE id = ?', ['123']);
  }
}
```

### Archivos de log

- `logs/error-%DATE%.log` - Solo errores
- `logs/combined-%DATE%.log` - Todos los logs

---

## 2. Email Service

### Configuración

Agrega estas variables de entorno:

```env
# Email Configuration
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@conozca.org
FRONTEND_URL=http://localhost:3000
```

**Nota**: Para Gmail, usa [App Passwords](https://support.google.com/accounts/answer/185833).

### Emails implementados

1. **Verificación de email** - Enviado al registrarse
2. **Reset de contraseña** - Enviado al olvidar contraseña
3. **Bienvenida** - Enviado tras verificar email
4. **Notificación de artículo** - Para admins

### Uso

```typescript
import { EmailService } from './common/email.service';

// Inyectar en constructor
constructor(private emailService: EmailService) {}

// Enviar email de verificación
await this.emailService.sendVerificationEmail(
  'user@example.com',
  'verification-token-here'
);

// Enviar reset de contraseña
await this.emailService.sendPasswordResetEmail(
  'user@example.com',
  'reset-token-here'
);

// Enviar email personalizado
await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Asunto',
  html: '<h1>Contenido HTML</h1>',
  text: 'Contenido texto plano',
});
```

### Modo Mock

Si `EMAIL_ENABLED` no es `true` o faltan credenciales, el servicio entra en modo mock y solo logea los emails sin enviarlos.

---

## 3. Upload Service

### Configuración

```env
# Upload Configuration
UPLOAD_PROVIDER=local  # local, cloudinary, s3
MAX_FILE_SIZE=5242880  # 5MB en bytes
API_URL=http://localhost:4000
```

### Endpoints

#### POST /uploads/image

Sube una imagen (autenticado).

**Request**:
```bash
curl -X POST http://localhost:4000/uploads/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=articles"
```

**Response**:
```json
{
  "url": "http://localhost:4000/uploads/articles/1704814800-abc123.jpg",
  "filename": "image.jpg",
  "size": 245678,
  "mimetype": "image/jpeg"
}
```

#### POST /uploads/info

Obtiene configuración del provider (autenticado).

**Response**:
```json
{
  "provider": "local",
  "maxFileSize": 5242880,
  "maxFileSizeMB": 5,
  "allowedMimeTypes": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml"
  ]
}
```

### Uso en código

```typescript
import { UploadService } from './common/upload.service';

constructor(private uploadService: UploadService) {}

async uploadFile(file: Express.Multer.File) {
  // Validar
  const validation = this.uploadService.validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Subir
  const url = await this.uploadService.uploadImage(file, 'articles');
  
  // Eliminar (si es local)
  await this.uploadService.deleteImage(url);
}
```

### Providers

#### Local (default)
- Archivos guardados en `uploads/` directory
- Servidos estáticamente por NestJS
- ✅ No requiere configuración adicional
- ⚠️ No recomendado para producción (sin CDN)

#### Cloudinary (TODO)
```env
UPLOAD_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

#### AWS S3 (TODO)
```env
UPLOAD_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
```

---

## 4. Comments System

### Modelo

```prisma
model Comment {
  id         String   @id @default(uuid())
  articleId  String
  userId     String
  content    String   @db.Text
  isApproved Boolean  @default(false)
  isReported Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  article    Article  @relation(...)
  user       User     @relation(...)
}
```

### Endpoints

#### POST /comments/article/:articleId
Crear comentario (autenticado).

```bash
curl -X POST http://localhost:4000/comments/article/ARTICLE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Excelente artículo!"}'
```

#### GET /comments/article/:articleId
Obtener comentarios de un artículo.

Query params:
- `includeUnapproved=true` - Solo para ADMIN

```bash
curl http://localhost:4000/comments/article/ARTICLE_ID
```

#### PATCH /comments/:id
Actualizar comentario (autor o ADMIN).

```bash
curl -X PATCH http://localhost:4000/comments/COMMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Contenido actualizado"}'
```

#### DELETE /comments/:id
Eliminar comentario (autor o ADMIN).

```bash
curl -X DELETE http://localhost:4000/comments/COMMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### PATCH /comments/:id/approve
Aprobar comentario (solo ADMIN).

```bash
curl -X PATCH http://localhost:4000/comments/COMMENT_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

#### PATCH /comments/:id/report
Reportar comentario (cualquier usuario autenticado).

```bash
curl -X PATCH http://localhost:4000/comments/COMMENT_ID/report \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### GET /comments/admin/pending
Obtener comentarios pendientes de moderación (solo ADMIN).

```bash
curl http://localhost:4000/comments/admin/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Flujo de moderación

1. Usuario crea comentario → `isApproved=false`
2. ADMIN revisa en `/comments/admin/pending`
3. ADMIN aprueba con `/comments/:id/approve` → `isApproved=true`
4. Comentario visible públicamente

---

## 5. Sentry Integration

### Configuración

```env
# Sentry Configuration
SENTRY_ENABLED=true
SENTRY_DSN=https://your-dsn@sentry.io/project-id
NODE_ENV=production
```

### Obtener DSN

1. Crear cuenta en [sentry.io](https://sentry.io)
2. Crear proyecto Node.js
3. Copiar DSN del proyecto

### Características

- ✅ Captura automática de excepciones
- ✅ Performance monitoring
- ✅ Profiling
- ✅ User context tracking
- ✅ Breadcrumbs
- ✅ Filtrado de datos sensibles (passwords, tokens)

### Uso manual

```typescript
import { SentryService } from './common/sentry.service';

constructor(private sentryService: SentryService) {}

// Capturar excepción
try {
  dangerousOperation();
} catch (error) {
  this.sentryService.captureException(error, {
    userId: user.id,
    operation: 'dangerous-op',
  });
}

// Capturar mensaje
this.sentryService.captureMessage('Operación crítica ejecutada', 'warning', {
  userId: user.id,
});

// Tracking de performance
await this.sentryService.capturePerformance(
  'database-query',
  async () => {
    return await this.prisma.user.findMany();
  }
);

// Agregar contexto del usuario
this.sentryService.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Breadcrumbs
this.sentryService.addBreadcrumb({
  message: 'Usuario inició sesión',
  category: 'auth',
  level: 'info',
  data: { userId: user.id },
});
```

### Captura automática

El `SentryInterceptor` captura automáticamente:
- Todas las excepciones no manejadas
- Contexto de usuario si está autenticado
- Detalles de la request (método, URL, status)

### Modo Mock

Si `SENTRY_ENABLED` no es `true` o falta `SENTRY_DSN`, el servicio entra en modo mock y solo logea localmente.

---

## Testing

### Verificar logs

```bash
# Ver logs en tiempo real
tail -f logs/combined-$(date +%Y-%m-%d).log

# Ver solo errores
tail -f logs/error-$(date +%Y-%m-%d).log
```

### Verificar emails

Con `EMAIL_ENABLED=false`, verás en los logs:
```
[MOCK] Email would be sent to user@example.com: Verify your account
```

### Verificar uploads

```bash
# Listar uploads
ls -la uploads/articles/

# Ver tamaño
du -sh uploads/
```

### Verificar Sentry

Con `SENTRY_ENABLED=false`, verás en los logs:
```
[MOCK] Sentry would capture exception: Error message
```

---

## Production Checklist

### Antes de desplegar

- [ ] Configurar SMTP real (no Gmail personal)
- [ ] Configurar Cloudinary o S3 para uploads
- [ ] Obtener Sentry DSN y configurar
- [ ] Configurar rotación de logs en servidor
- [ ] Configurar backup de `uploads/` directory
- [ ] Habilitar HTTPS
- [ ] Configurar firewall
- [ ] Configurar rate limiting más estricto

### Variables de entorno de producción

```env
# General
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/conozca_prod

# JWT
JWT_SECRET=super-secure-secret-key-min-32-chars
JWT_REFRESH_SECRET=another-super-secure-secret-key

# Email
EMAIL_ENABLED=true
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=noreply@conozca.org
FRONTEND_URL=https://conozca.org

# Upload
UPLOAD_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
MAX_FILE_SIZE=5242880
API_URL=https://api.conozca.org

# Sentry
SENTRY_ENABLED=true
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Swagger
ENABLE_SWAGGER=false
```

---

## Recursos

### Documentación

- [Winston](https://github.com/winstonjs/winston)
- [Nodemailer](https://nodemailer.com/)
- [Multer](https://github.com/expressjs/multer)
- [Sentry Node](https://docs.sentry.io/platforms/node/)
- [Cloudinary](https://cloudinary.com/documentation)
- [AWS S3](https://docs.aws.amazon.com/s3/)

### Swagger

Todos los endpoints están documentados en:
```
http://localhost:4000/api/docs
```

### Postman

Collection actualizado con todos los endpoints en:
```
postman/ConozcaAPI.postman_collection.json
```

---

## Próximos pasos

1. Implementar Cloudinary/S3 en `upload.service.ts`
2. Configurar SendGrid o AWS SES para emails en producción
3. Agregar tests E2E para comentarios
4. Implementar notificaciones por email cuando se aprueba un comentario
5. Agregar rate limiting específico para uploads
6. Implementar cache con Redis
7. Agregar search con Elasticsearch

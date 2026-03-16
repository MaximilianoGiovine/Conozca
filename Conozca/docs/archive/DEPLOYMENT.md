# 🚀 Guía de Deployment - Conozca API

## Requisitos Previos

- Docker y Docker Compose instalados
- Node.js 20+ y pnpm (para desarrollo local)
- Acceso al servidor de producción (si aplica)

---

## 🏃 Quick Start

### 1. Configurar Variables de Entorno

```bash
# Copiar ejemplo a .env
cp .env.example .env

# Generar secrets seguros
./scripts/generate-secrets.sh

# Editar .env con los secrets generados
nano .env
```

### 2. Desplegar con Docker Compose

```bash
# Desarrollo (incluye pgAdmin)
./scripts/deploy.sh dev

# Staging
./scripts/deploy.sh staging

# Producción
./scripts/deploy.sh production
```

### 3. Verificar Deployment

```bash
# Health check
curl http://localhost:3000/health

# Ver logs
docker-compose logs -f api
```

---

## 📦 Build Manual

### Build de Docker Image

```bash
# Desde la raíz del monorepo
docker build -t conozca-api:latest -f apps/api/Dockerfile .

# Con tag específico
docker build -t conozca-api:v1.0.0 -f apps/api/Dockerfile .
```

### Run sin Docker Compose

```bash
# 1. Iniciar PostgreSQL
docker run -d \
  --name conozca-postgres \
  -e POSTGRES_USER=conozca \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=conozca_db \
  -p 5432:5432 \
  postgres:16-alpine

# 2. Run migraciones
cd packages/database
DATABASE_URL="postgresql://conozca:your_password@localhost:5432/conozca_db" \
  pnpm exec prisma migrate deploy

# 3. Iniciar API
docker run -d \
  --name conozca-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://conozca:your_password@host.docker.internal:5432/conozca_db" \
  -e JWT_SECRET="your_secret" \
  -e JWT_REFRESH_SECRET="your_refresh_secret" \
  conozca-api:latest
```

---

## 🔄 Rollback

```bash
# Listar versiones disponibles
docker images conozca-api

# Ejecutar rollback
./scripts/rollback.sh
# Seguir instrucciones en pantalla
```

---

## 🌍 Deployment a Producción

### Opción 1: VPS/Servidor Dedicado

```bash
# 1. SSH al servidor
ssh user@your-server.com

# 2. Clonar repo (si es primera vez)
git clone https://github.com/tu-org/conozca-monorepo.git
cd conozca-monorepo

# 3. Pull últimos cambios
git pull origin main

# 4. Configurar .env de producción
cp .env.production.example .env.production
nano .env.production
# Configurar todos los valores

# 5. Deploy
./scripts/deploy.sh production
```

### Opción 2: Docker Registry

```bash
# 1. Build y push a registry
docker build -t your-registry/conozca-api:latest -f apps/api/Dockerfile .
docker push your-registry/conozca-api:latest

# 2. En el servidor, pull y run
docker pull your-registry/conozca-api:latest
docker-compose up -d
```

### Opción 3: CI/CD Automático

El pipeline de GitHub Actions se encarga de:
- ✅ Tests automáticos
- ✅ Build de imagen Docker
- ✅ Deploy a staging (branch develop)
- ✅ Deploy a producción (branch main)

Configurar secrets en GitHub:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- Variables de entorno de producción

---

## 🔧 Configuración de Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name api.conozca.org;
    
    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.conozca.org;
    
    ssl_certificate /etc/letsencrypt/live/api.conozca.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.conozca.org/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

---

## 📊 Monitoring

### Health Check

```bash
# Simple check
curl http://localhost:3000/health

# Response esperado:
{
  "status": "ok",
  "timestamp": "2026-01-09T14:30:00.000Z",
  "uptime": 1234.56
}
```

### Logs

```bash
# Ver logs en tiempo real
docker-compose logs -f api

# Últimas 100 líneas
docker-compose logs --tail=100 api

# Logs de PostgreSQL
docker-compose logs postgres
```

### Stats de Containers

```bash
# Uso de recursos
docker stats conozca-api conozca-postgres

# Inspeccionar container
docker inspect conozca-api
```

---

## 🐛 Troubleshooting

### API no responde

```bash
# 1. Verificar que el container está corriendo
docker ps

# 2. Ver logs
docker-compose logs api

# 3. Verificar health
docker inspect --format='{{.State.Health.Status}}' conozca-api

# 4. Reiniciar
docker-compose restart api
```

### Error de base de datos

```bash
# 1. Verificar conexión
docker-compose exec postgres psql -U conozca -d conozca_db -c "SELECT 1"

# 2. Verificar migraciones
docker-compose exec api sh -c "cd ../packages/database && npx prisma migrate status"

# 3. Aplicar migraciones faltantes
docker-compose exec api sh -c "cd ../packages/database && npx prisma migrate deploy"
```

### Limpiar y empezar de cero

```bash
# ⚠️  CUIDADO: Esto borra todos los datos

# Detener y eliminar containers
docker-compose down -v

# Eliminar imágenes
docker rmi conozca-api:latest

# Rebuild y restart
./scripts/deploy.sh dev
```

---

## 🔐 Seguridad en Producción

### Checklist

- [ ] JWT secrets únicos y seguros (64+ chars)
- [ ] PostgreSQL password seguro
- [ ] CORS configurado solo para dominios permitidos
- [ ] SSL/TLS habilitado (HTTPS)
- [ ] Rate limiting activo
- [ ] Environment variables nunca en el código
- [ ] Logs de auditoría activados
- [ ] Backups automáticos de DB
- [ ] Firewall configurado
- [ ] Container corriendo como non-root user

### Generar Secrets Seguros

```bash
./scripts/generate-secrets.sh
```

---

## 📈 Performance Tips

### Database Connection Pooling

En producción, ajustar en DATABASE_URL:
```
?connection_limit=20&pool_timeout=20
```

### Docker Resource Limits

```yaml
# En docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### Enable Caching

```typescript
// Futura implementación con Redis
```

---

## 📝 Comandos Útiles

```bash
# Ver todos los containers
docker ps -a

# Eliminar containers detenidos
docker container prune

# Ver uso de espacio
docker system df

# Limpiar todo (images, containers, volumes)
docker system prune -a --volumes

# Backup de base de datos
docker-compose exec postgres pg_dump -U conozca conozca_db > backup_$(date +%Y%m%d).sql

# Restore de base de datos
docker-compose exec -T postgres psql -U conozca conozca_db < backup.sql
```

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica el health check: `curl http://localhost:3000/health`
3. Consulta esta guía de troubleshooting
4. Abre un issue en GitHub

---

**Fecha**: 9 de enero de 2026  
**Versión**: 1.0.0

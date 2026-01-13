# Phase 3: Backend Optimizations - Quick Reference Guide

## 🚀 Start Development (30 seconds)

```bash
# Terminal 1: PostgreSQL
docker-compose up -d

# Terminal 2: API
cd apps/api && pnpm start:dev

# Terminal 3: Open Swagger
open http://localhost:4000/api/docs
```

## 🔧 Configure Environment

```bash
# Copy template
cp apps/api/.env.example apps/api/.env

# Edit with your configuration
nano apps/api/.env
```

### Minimal .env (Development)
```env
NODE_ENV=development
DATABASE_URL=postgresql://conozca_user:conozca_pass@localhost:5432/conozca_db
JWT_SECRET=dev-secret-min-32-chars-required!!
JWT_REFRESH_SECRET=dev-secret-min-32-chars-required!!
EMAIL_ENABLED=false
UPLOAD_PROVIDER=local
SENTRY_ENABLED=false
ENABLE_SWAGGER=true
```

## 📧 Email Service

### Enable Email
```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@conozca.org
FRONTEND_URL=http://localhost:3000
```

### Test Email (cURL)
```bash
# Register user (triggers verification email)
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "name": "Test User"
  }'
```

## 📤 Upload Service

### Configure Provider

#### Local (Default - Development)
```env
UPLOAD_PROVIDER=local
MAX_FILE_SIZE=5242880
API_URL=http://localhost:4000
```

#### Cloudinary (Production)
```env
UPLOAD_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### Upload Image (cURL)
```bash
curl -X POST http://localhost:4000/uploads/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=articles"
```

### Get Configuration
```bash
curl http://localhost:4000/uploads/info \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 💬 Comments System

### Create Comment
```bash
curl -X POST http://localhost:4000/comments/article/ARTICLE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great article!"}'
```

### Get Approved Comments
```bash
curl http://localhost:4000/comments/article/ARTICLE_ID
```

### Get All Comments (Admin)
```bash
curl "http://localhost:4000/comments/article/ARTICLE_ID?includeUnapproved=true" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Approve Comment (Admin)
```bash
curl -X PATCH http://localhost:4000/comments/COMMENT_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Report Comment
```bash
curl -X PATCH http://localhost:4000/comments/COMMENT_ID/report \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Admin Moderation Panel
```bash
curl http://localhost:4000/comments/admin/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 🐛 Sentry Monitoring

### Enable Sentry
```env
SENTRY_ENABLED=true
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### Create Sentry Project
1. Go to https://sentry.io
2. Create organization and project
3. Copy DSN
4. Add to .env

### View Errors
Dashboard: https://sentry.io/organizations/your-org/

## 📊 Logging

### View Logs (Real-time)
```bash
# Combined logs
tail -f apps/api/logs/combined-$(date +%Y-%m-%d).log

# Error logs only
tail -f apps/api/logs/error-$(date +%Y-%m-%d).log

# Search logs
grep "ERROR" apps/api/logs/*.log
grep "business_event" apps/api/logs/*.log
```

### Log Locations
- Combined: `apps/api/logs/combined-YYYY-MM-DD.log`
- Errors: `apps/api/logs/error-YYYY-MM-DD.log`
- Max age: 30 days (auto-cleanup)

## 🧪 Testing

### Run All Tests
```bash
cd apps/api
pnpm test
```

### Run Comment Tests
```bash
pnpm test comment.service.spec.ts
```

### Run E2E Tests
```bash
pnpm test:e2e
```

### Test Coverage
```bash
pnpm test:cov
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `BACKEND_OPTIMIZATIONS.md` | Complete guide (5,000+ words) |
| `EXAMPLES_USAGE.md` | Code examples |
| `DEPLOYMENT_PRODUCTION_READY.md` | Production deployment |
| `PHASE3_FINAL_SUMMARY.md` | Phase 3 completion |
| `API_DOCUMENTATION.md` | API endpoints |
| `INTEGRATION_GUIDES.md` | Frontend integration |

## 🔑 Authentication Flow

### 1. Register
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "name": "User Name"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

### 3. Use Token
```bash
curl http://localhost:4000/comments/article/ID \
  -H "Authorization: Bearer eyJhbGc..."
```

### 4. Refresh Token
```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "eyJhbGc..."}'
```

## 🔄 Database Management

### Run Migrations
```bash
cd packages/database
pnpm prisma migrate deploy
```

### Create Migration
```bash
pnpm prisma migrate dev --name migration_name
```

### Reset Database (⚠️ DELETES DATA)
```bash
pnpm prisma migrate reset
```

### View Database
```bash
# PostgreSQL CLI
psql -U conozca_user -d conozca_db
SELECT * FROM "Comment";
SELECT * FROM "User";
```

## 🔍 Swagger UI

### Access Swagger
```
http://localhost:4000/api/docs
```

### Swagger Features
- ✅ Try-it-out endpoints
- ✅ Authorization token input
- ✅ Request/response examples
- ✅ Schema documentation
- ✅ Rate limiting info

## 📦 Dependencies Check

```bash
# List installed packages
cd apps/api && npm list | head -30

# Check versions
npm list winston nodemailer multer @sentry/node cloudinary

# Update packages (careful!)
npm update
```

## 🛠️ Build & Deploy

### Build for Production
```bash
cd apps/api
pnpm run build
```

### Start Production
```bash
NODE_ENV=production pnpm start
```

### Docker Build
```bash
docker build -t conozca-api:latest .
docker run -p 4000:4000 -e DATABASE_URL=... conozca-api:latest
```

## 🚨 Troubleshooting

### API won't start
```bash
# Check if port 4000 is free
lsof -i :4000

# Kill process on port 4000
kill -9 $(lsof -t -i:4000)

# Restart
cd apps/api && pnpm start:dev
```

### Database connection error
```bash
# Check Docker
docker ps

# Check PostgreSQL
docker logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Email not sending
```bash
# Check environment
echo $EMAIL_ENABLED

# Check logs
tail apps/api/logs/combined-*.log | grep "email"

# Enable debug
NODE_ENV=development pnpm start:dev
```

### Build errors
```bash
# Clean
rm -rf dist node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# Rebuild
pnpm run build
```

## 📞 Support

- **Swagger UI**: http://localhost:4000/api/docs
- **Postman**: `postman/ConozcaAPI.postman_collection.json`
- **Docs**: See `BACKEND_OPTIMIZATIONS.md`
- **Issues**: Check logs in `apps/api/logs/`

## 🎯 Common Tasks

### Create Test User
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123!",
    "name": "Admin User"
  }'
```

### Upload Test Image
```bash
# First, login to get token
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}' | jq -r '.access_token')

# Upload image
curl -X POST http://localhost:4000/uploads/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=articles"
```

### Create Article with Comment
```bash
# 1. Create article (see API docs)
# 2. Get article ID
# 3. Add comment
curl -X POST http://localhost:4000/comments/article/ARTICLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great!"}'
```

## ⚡ Performance Tips

- **Logging**: Use business events for important actions
- **Upload**: Cloudinary for production, local for dev
- **Comments**: Index on articleId for fast queries
- **Cache**: Coming in Phase 4 (Redis)
- **Search**: Coming in Phase 4 (Elasticsearch)

## 🔐 Security Reminders

- ✅ Never commit .env file
- ✅ Keep JWT_SECRET private
- ✅ Use strong database passwords
- ✅ Enable HTTPS in production
- ✅ Rotate secrets regularly
- ✅ Review Sentry errors daily
- ✅ Backup database regularly

---

**Last Updated**: January 9, 2026  
**Status**: ✅ Production Ready

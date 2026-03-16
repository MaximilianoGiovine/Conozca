# 🚀 Conozca Platform - Features & Capabilities

**Status**: ✅ Production Ready  
**Build**: Passing  
**Tests**: Passing  
**API Version**: v1  
**Last Updated**: January 14, 2026

---

## 📑 Table of Contents

1. [Phase 1: Authentication & Security](#phase-1-authentication--security)
2. [Phase 2: Articles Module](#phase-2-articles-module)
3. [Phase 3: Backend Optimizations](#phase-3-backend-optimizations)
4. [Technology Stack](#technology-stack)
5. [API Endpoints](#api-endpoints)
6. [Security Features](#security-features)

---

## Phase 1: Authentication & Security

### ✅ JWT Token Management
- **Access Tokens**: 15 minutes validity
- **Refresh Tokens**: 7 days validity with rotation
- **Reset Tokens**: 1 hour validity, SHA-256 hashed in database
- **Strategy**: JWT with Passport.js + @nestjs/jwt

### ✅ Authentication Endpoints (6)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/register` | POST | Create new account | No |
| `/auth/login` | POST | Login with credentials | No |
| `/auth/refresh` | POST | Refresh access token | Refresh Token |
| `/auth/logout` | POST | Logout (revoke tokens) | Access Token |
| `/auth/forgot-password` | POST | Request password reset | No |
| `/auth/reset-password` | POST | Complete password reset | Reset Token |

### ✅ Security Features
- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Signatures**: HS256 algorithm
- **Refresh Token Rotation**: Automatic rotation with reuse detection
- **Token Reuse Detection**: Revokes all sessions on reuse attempt
- **Timing Attack Protection**: Constant-time responses in password reset
- **Trust Proxy**: Configured for Nginx/Load Balancer
- **Email Verification**: SHA-256 hashed tokens (256-bit)
- **Security Event Logging**: All auth events logged
- **Role-Based Access Control**: USER, EDITOR, ADMIN roles

### 🔒 Security Hardening (Recent)
- ✅ Upgraded bcrypt from 10 to 12 rounds
- ✅ Reset tokens hashed with SHA-256 before database storage
- ✅ JWT secret validation at startup (min 32 chars)
- ✅ Refresh token reuse detection with session revocation
- ✅ Trust proxy configuration for correct IP detection
- ✅ Empty catch blocks replaced with proper logging
- ✅ Timing attack protection in forgot password
- ✅ Security event logging for all critical operations

### 📁 Files
```
apps/api/src/auth/
├── auth.service.ts        (405 lines) - Authentication logic
├── auth.controller.ts     (100+ lines) - 6 HTTP endpoints
├── auth.module.ts         - Module configuration
├── auth.dto.ts           - Data Transfer Objects
├── auth.guard.ts         - JWT guard
└── optional-auth.guard.ts - Optional authentication
```

---

## Phase 2: Articles Module

### ✅ Data Models
- **Article**: Articles with states (DRAFT, PUBLISHED, ARCHIVED)
- **ArticleBlock**: Rich content blocks (text, image, video, code, quote)
- **Author**: Article authors with bio
- **Category**: Organization categories
- **View**: View tracking for analytics

### ✅ Article Features
- **Rich Content Editor**: Block-based editor with multiple block types
- **Watermarking**: Automatic watermark on images (configurable)
- **PDF Export**: Export articles to PDF with custom styling
- **View Tracking**: Automatic view counting
- **State Management**: Draft → Published → Archived workflow
- **Slug Management**: SEO-friendly URLs with uniqueness validation
- **Category System**: Hierarchical categories
- **Author Management**: Dedicated author profiles

### ✅ Article Block Types
1. **Text Block**: Rich text content with formatting
2. **Image Block**: Images with alt text and watermarking
3. **Video Block**: Embedded video (YouTube, Vimeo, etc.)
4. **Code Block**: Syntax-highlighted code snippets
5. **Quote Block**: Styled quotations with attribution

### ✅ Article Endpoints (14)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/articles` | GET | List articles (paginated) | Optional |
| `/articles` | POST | Create article | EDITOR/ADMIN |
| `/articles/:slug` | GET | Get article by slug | Optional |
| `/articles/:id` | GET | Get article by ID | Optional |
| `/articles/:id` | PATCH | Update article | EDITOR/ADMIN |
| `/articles/:id` | DELETE | Delete article | EDITOR/ADMIN |
| `/articles/:id/pdf` | GET | Export article to PDF | Optional |
| `/articles/:id/blocks` | POST | Add content block | EDITOR/ADMIN |
| `/articles/:id/blocks/:blockId` | PATCH | Update block | EDITOR/ADMIN |
| `/articles/:id/blocks/:blockId` | DELETE | Delete block | EDITOR/ADMIN |
| `/categories` | GET | List categories | No |
| `/categories` | POST | Create category | ADMIN |
| `/authors` | GET | List authors | No |
| `/authors` | POST | Create author | ADMIN |

### 📁 Files
```
apps/api/src/articles/
├── article.service.ts     (440+ lines) - Business logic
├── article.controller.ts  (200+ lines) - 14 endpoints
├── article.module.ts      - Module configuration
├── article.dto.ts         - Data Transfer Objects
└── article.types.ts       - TypeScript types
```

---

## Phase 3: Backend Optimizations

### ✅ Winston Logger (140 lines)
**Status**: Production Ready

**Features**:
- Structured JSON logging for production
- Colorized console output for development
- Automatic file rotation (error: 30d, combined: 14d)
- HTTP request tracking with duration
- Business event logging
- Query logging for debugging

**Files**: [apps/api/src/common/logger.service.ts](apps/api/src/common/logger.service.ts), [apps/api/src/common/logger.middleware.ts](apps/api/src/common/logger.middleware.ts)

### ✅ Email Service (180 lines)
**Status**: Integrated

**Features**:
- SMTP email sending with Nodemailer
- 4 email templates (verification, password reset, welcome, notifications)
- Mock mode for development
- HTML responsive templates
- Integrated with authentication flow

**Providers Supported**: Gmail, SendGrid, AWS SES, Custom SMTP

**Files**: [apps/api/src/common/email.service.ts](apps/api/src/common/email.service.ts)

### ✅ Upload Service (200+ lines)
**Status**: Production Ready

**Features**:
- Multi-provider support (Local ✅, Cloudinary ✅, S3 prepared)
- File validation (size, MIME type)
- Local storage with static serving
- Business event logging
- Error handling and fallback

**Endpoints**:
- `POST /uploads/image` - Upload image
- `GET /uploads/info` - Get configuration

**Files**: [apps/api/src/uploads/upload.service.ts](apps/api/src/uploads/upload.service.ts), [apps/api/src/uploads/upload.controller.ts](apps/api/src/uploads/upload.controller.ts)

### ✅ Comments System (350+ lines)
**Status**: Fully Tested (13/13 passing)

**Features**:
- Full CRUD operations
- Moderation system (isApproved)
- Report mechanism (isReported)
- Admin panel for pending comments
- User context (author can only edit own comments)
- Rate limiting (10 comments/minute)
- 8 REST endpoints

**Endpoints**:
- `POST /comments/article/:articleId` - Create comment (rate limited)
- `GET /comments/article/:articleId` - Get article comments
- `GET /comments/:id` - Get comment by ID
- `PATCH /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment
- `PATCH /comments/:id/approve` - Approve comment (ADMIN)
- `PATCH /comments/:id/report` - Report comment
- `GET /comments/admin/pending` - Get pending comments (ADMIN)

**Files**: [apps/api/src/comments/comment.service.ts](apps/api/src/comments/comment.service.ts), [apps/api/src/comments/comment.controller.ts](apps/api/src/comments/comment.controller.ts)

### ✅ Sentry Integration (240 lines)
**Status**: Production Ready

**Features**:
- Automatic exception capturing
- Performance monitoring
- User context tracking
- Breadcrumb trail
- Data filtering (removes sensitive info)
- Mock mode for development

**Files**: [apps/api/src/common/sentry.service.ts](apps/api/src/common/sentry.service.ts), [apps/api/src/common/sentry.interceptor.ts](apps/api/src/common/sentry.interceptor.ts)

---

## Technology Stack

### Backend (NestJS 11)
- **Framework**: NestJS 11.1.10
- **Runtime**: Node.js 20+
- **Package Manager**: pnpm 9+
- **Database**: PostgreSQL 15+ with Prisma 7
- **Authentication**: JWT with Passport.js
- **Logging**: Winston 3.19.0
- **Email**: Nodemailer 7.0.12
- **Monitoring**: Sentry 10.32.1
- **File Upload**: Multer 2.0.2 + Cloudinary 2.8.0
- **Rate Limiting**: @nestjs/throttler

### Frontend (Next.js 15)
- **Framework**: Next.js 15.3.2
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS
- **State Management**: React Context/Hooks
- **API Client**: Fetch API

### DevOps
- **Containerization**: Docker + Docker Compose
- **Monorepo**: Turborepo
- **CI/CD**: GitHub Actions (prepared)
- **Deployment**: Railway, Vercel, or custom VPS

---

## API Endpoints

### Summary by Module

| Module | Endpoints | Auth Required | Rate Limited |
|--------|-----------|---------------|--------------|
| Authentication | 6 | Varies | Yes |
| Articles | 14 | Varies | No |
| Comments | 8 | Varies | Yes (create) |
| Authors | 2 | Optional | No |
| Categories | 2 | Optional | No |
| Uploads | 2 | Required | Yes |
| **Total** | **34** | - | - |

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.conozca.com` (configure your domain)

### Authentication Header
```
Authorization: Bearer <access_token>
```

### Rate Limiting
- **Global**: 100 requests/minute per IP
- **Auth endpoints**: 10 requests/minute per IP
- **Comment creation**: 10 requests/minute per user

---

## Security Features

### ✅ Implemented
1. **Password Security**
   - bcrypt with 12 salt rounds
   - Password complexity validation (min 8 chars)
   - Secure password reset flow with hashed tokens

2. **Token Security**
   - JWT with strong secrets (validated at startup)
   - Refresh token rotation with reuse detection
   - Token revocation on password reset
   - Secure token storage (hashed in database)

3. **API Security**
   - Trust proxy configuration
   - CORS with whitelist
   - Rate limiting (global + per-endpoint)
   - Input validation with class-validator
   - SQL injection prevention (Prisma)

4. **Monitoring & Logging**
   - Winston structured logging
   - Security event logging
   - Sentry error tracking
   - Request/response logging

5. **Attack Prevention**
   - Timing attack protection
   - CSRF protection (planned)
   - XSS prevention (HTML sanitization)
   - Email enumeration protection

### 🔐 Environment Variables Required
```bash
# JWT (REQUIRED - min 32 chars)
JWT_SECRET=<strong-secret-32-chars-min>
JWT_REFRESH_SECRET=<different-strong-secret-32-chars-min>

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/conozca

# Email (Optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Sentry (Optional)
SENTRY_DSN=https://...@sentry.io/...

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## Database Schema

### Core Models
- **User** - Authentication + profile
- **Article** - Blog posts with rich content
- **ArticleBlock** - Content blocks (text, image, video, code, quote)
- **Comment** - User comments with moderation
- **Author** - Article authors
- **Category** - Content organization
- **View** - Analytics tracking
- **Session** - Refresh token rotation
- **EmailVerificationToken** - Email verification

### Relationships
- User → Article (one-to-many via editorId)
- Article → ArticleBlock (one-to-many)
- Article → Comment (one-to-many)
- Article → Author (many-to-one)
- Article → Category (many-to-one)
- User → Session (one-to-many)
- User → EmailVerificationToken (one-to-one)

---

## Testing

### Backend Tests
- **Comments Module**: 13/13 passing ✅
- **Auth Module**: Manual testing (Postman collection available)
- **Articles Module**: Manual testing

### Test Commands
```bash
# Run all tests
pnpm test

# Run specific module tests
pnpm test:comments

# Run e2e tests
pnpm test:e2e

# Coverage report
pnpm test:cov
```

---

## Deployment

### Production Checklist
- ✅ Environment variables configured
- ✅ Database migrations applied
- ✅ JWT secrets validated (min 32 chars)
- ✅ Rate limiting enabled
- ✅ CORS configured
- ✅ Trust proxy enabled
- ✅ Logging configured (Winston)
- ✅ Error monitoring configured (Sentry)
- ✅ Email service configured
- ✅ File upload configured (Cloudinary or S3)

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Manual Deployment
```bash
# Install dependencies
pnpm install

# Build API
pnpm --filter @conozca/api build

# Run migrations
pnpm --filter @conozca/database prisma:migrate:deploy

# Start production server
pnpm --filter @conozca/api start:prod
```

---

## Next Steps (Phase 4)

### Frontend Development
- [ ] Authentication UI (Login, Register, Password Reset)
- [ ] Article listing page
- [ ] Article detail page with rich content rendering
- [ ] Article editor with block-based UI
- [ ] Comment system UI
- [ ] Admin dashboard
- [ ] User profile page

### Additional Features (Future)
- [ ] Article search functionality
- [ ] Tags system
- [ ] Article reactions (like, bookmark)
- [ ] Social media sharing
- [ ] SEO metadata management
- [ ] Multi-language support
- [ ] Newsletter subscription
- [ ] Analytics dashboard

---

## Documentation

- [API Documentation](API_DOCUMENTATION.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Quick Start Guide](QUICK_START.md)
- [Testing Guide](apps/api/TESTING_GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Integration Guides](INTEGRATION_GUIDES.md)

---

## Postman Collection

Import the Postman collection for easy API testing:
- Collection: [postman/ConozcaAPI.postman_collection.json](postman/ConozcaAPI.postman_collection.json)
- Environments:
  - Development: [postman/ConozcaAPI.postman_environment.json](postman/ConozcaAPI.postman_environment.json)
  - Staging: [postman/ConozcaAPI.postman_environment.staging.json](postman/ConozcaAPI.postman_environment.staging.json)
  - Production: [postman/ConozcaAPI.postman_environment.production.json](postman/ConozcaAPI.postman_environment.production.json)

---

**Built with ❤️ by the Conozca Team**  
Last updated: January 14, 2026

#!/bin/bash

# ============================================
# CONOZCA - Quick Setup Guide
# ============================================

echo "🚀 Conozca Backend - Configuración Rápida"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paso 1: Verificar Docker
echo -e "\n${BLUE}[1/5]${NC} Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker no está instalado${NC}"
    echo "Descarga Docker desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo -e "${GREEN}✓ Docker encontrado${NC}"

# Paso 2: Iniciar PostgreSQL
echo -e "\n${BLUE}[2/5]${NC} Iniciando PostgreSQL..."
docker-compose up -d
sleep 3
echo -e "${GREEN}✓ PostgreSQL corriendo${NC}"

# Paso 3: Instalar dependencias
echo -e "\n${BLUE}[3/5]${NC} Instalando dependencias..."
pnpm install
echo -e "${GREEN}✓ Dependencias instaladas${NC}"

# Paso 4: Configurar variables de entorno
echo -e "\n${BLUE}[4/5]${NC} Configurando ambiente..."

if [ ! -f "apps/api/.env" ]; then
    cp apps/api/.env.example apps/api/.env
    echo -e "${YELLOW}⚠ Creado apps/api/.env${NC}"
    echo -e "${YELLOW}⚠ Actualiza las credenciales si es necesario${NC}"
else
    echo -e "${GREEN}✓ .env ya existe${NC}"
fi

# Paso 5: Migraciones de BD
echo -e "\n${BLUE}[5/5]${NC} Aplicando migraciones..."
cd packages/database
pnpm prisma generate
pnpm prisma migrate deploy
cd ../..
echo -e "${GREEN}✓ Base de datos lista${NC}"

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Configuración completada${NC}"
echo ""
echo "📚 Próximos pasos:"
echo ""
echo "1. Inicia el API:"
echo -e "   ${BLUE}cd apps/api && pnpm start:dev${NC}"
echo ""
echo "2. Accede a Swagger UI:"
echo -e "   ${BLUE}http://localhost:4000/api/docs${NC}"
echo ""
echo "3. Importa la colección Postman:"
echo -e "   ${BLUE}postman/ConozcaAPI.postman_collection.json${NC}"
echo ""
echo "4. Lee la documentación:"
echo -e "   ${BLUE}cat BACKEND_OPTIMIZATIONS.md${NC}"
echo ""
echo "📧 Email (desarrollo):"
echo -e "   Deshabilitado por defecto. Ver en logs con [MOCK]"
echo ""
echo "📤 Uploads (desarrollo):"
echo -e "   Guardados en: uploads/"
echo ""
echo "🐛 Sentry (desarrollo):"
echo -e "   Deshabilitado por defecto. Ver en logs con [MOCK]"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

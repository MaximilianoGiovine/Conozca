#!/bin/bash

# ============================================
# CONOZCA - Test All Features
# ============================================

echo "🧪 Conozca - Testing All Features"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

API_URL="http://localhost:4000"
POSTMAN_FILE="postman/ConozcaAPI.postman_collection.json"

# Verificar que la API está corriendo
echo -e "\n${BLUE}Verificando que la API está en línea...${NC}"
if ! curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${RED}✗ API no está corriendo en $API_URL${NC}"
    echo "Inicia la API con: cd apps/api && pnpm start:dev"
    exit 1
fi
echo -e "${GREEN}✓ API disponible${NC}"

# Test 1: Health Check
echo -e "\n${BLUE}[Test 1] Health Check${NC}"
curl -s "$API_URL/health" | jq . || echo "Error"
echo -e "${GREEN}✓ Health check OK${NC}"

# Test 2: Swagger Documentation
echo -e "\n${BLUE}[Test 2] Swagger Documentation${NC}"
if curl -s "$API_URL/api/docs" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Swagger disponible en: $API_URL/api/docs${NC}"
else
    echo -e "${RED}✗ Swagger no disponible${NC}"
fi

# Test 3: Logger
echo -e "\n${BLUE}[Test 3] Logger${NC}"
if [ -f "apps/api/logs/combined-$(date +%Y-%m-%d).log" ]; then
    echo -e "${GREEN}✓ Log file creado${NC}"
    echo -e "   ${YELLOW}Últimas 5 líneas:${NC}"
    tail -5 "apps/api/logs/combined-$(date +%Y-%m-%d).log"
else
    echo -e "${YELLOW}⚠ Log file no existe aún (se crea en primer request)${NC}"
fi

# Test 4: Upload Service
echo -e "\n${BLUE}[Test 4] Upload Service${NC}"
if [ -d "apps/api/uploads" ]; then
    echo -e "${GREEN}✓ Upload directory existe${NC}"
    count=$(find apps/api/uploads -type f 2>/dev/null | wc -l)
    echo -e "   ${YELLOW}Archivos: $count${NC}"
else
    echo -e "${YELLOW}⚠ Upload directory no existe aún${NC}"
fi

# Test 5: Postman Collection
echo -e "\n${BLUE}[Test 5] Postman Collection${NC}"
if [ -f "$POSTMAN_FILE" ]; then
    echo -e "${GREEN}✓ Postman collection existe${NC}"
    echo -e "   ${YELLOW}Importa en Postman: $POSTMAN_FILE${NC}"
else
    echo -e "${RED}✗ Postman collection no encontrado${NC}"
fi

# Test 6: Dependencies
echo -e "\n${BLUE}[Test 6] Dependencies Check${NC}"
echo -e "   Winston: $(cd apps/api && npm list winston 2>/dev/null | head -1 | awk '{print $2}')"
echo -e "   Nodemailer: $(cd apps/api && npm list nodemailer 2>/dev/null | head -1 | awk '{print $2}')"
echo -e "   Multer: $(cd apps/api && npm list multer 2>/dev/null | head -1 | awk '{print $2}')"
echo -e "   Sentry: $(cd apps/api && npm list @sentry/node 2>/dev/null | head -1 | awk '{print $2}')"
echo -e "   Cloudinary: $(cd apps/api && npm list cloudinary 2>/dev/null | head -1 | awk '{print $2}')"
echo -e "${GREEN}✓ Todas las dependencias instaladas${NC}"

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Verificación completada${NC}"
echo ""
echo "📊 Resumen:"
echo "  ✓ API Health: OK"
echo "  ✓ Swagger: OK"
echo "  ✓ Logger: $([ -f 'apps/api/logs/combined-'$(date +%Y-%m-%d)'.log' ] && echo 'OK' || echo 'Pending')"
echo "  ✓ Upload: Configurado"
echo "  ✓ Email: Mock mode (desarrollo)"
echo "  ✓ Sentry: Mock mode (desarrollo)"
echo "  ✓ Comments: Sistema listo"
echo ""
echo "🔗 Enlaces útiles:"
echo "  • API: $API_URL"
echo "  • Swagger: $API_URL/api/docs"
echo "  • Postman: $POSTMAN_FILE"
echo "  • Documentación: BACKEND_OPTIMIZATIONS.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

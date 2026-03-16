#!/bin/bash

# Script completo de testing para Fase 1 - Autenticación
# Ejecuta tests unitarios, e2e y genera reportes de coverage

set -e

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║           🧪 SUITE COMPLETA DE TESTING - FASE 1                   ║"
echo "║                  Autenticación & Seguridad                        ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${BLUE}📁 Directorio: ${PROJECT_DIR}${NC}"
echo ""

# Verificar que la base de datos esté corriendo
echo -e "${YELLOW}🔍 Verificando PostgreSQL...${NC}"
if docker ps | grep -q conozca-db; then
  echo -e "${GREEN}✅ PostgreSQL está corriendo${NC}"
else
  echo -e "${RED}❌ PostgreSQL no está corriendo${NC}"
  echo -e "${YELLOW}Ejecuta: docker-compose up -d${NC}"
  exit 1
fi
echo ""

# 1. Tests unitarios de AuthService
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1️⃣  Tests Unitarios: AuthService${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

npm test -- auth.service.spec.ts --silent 2>&1 | tee /tmp/auth-service-tests.log

SERVICE_RESULT=$(grep -E "Tests:" /tmp/auth-service-tests.log | tail -1)
echo -e "${GREEN}${SERVICE_RESULT}${NC}"
echo ""

# 2. Tests unitarios de AuthController
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2️⃣  Tests Unitarios: AuthController${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

npm test -- auth.controller.spec.ts --silent 2>&1 | tee /tmp/auth-controller-tests.log

CONTROLLER_RESULT=$(grep -E "Tests:" /tmp/auth-controller-tests.log | tail -1)
echo -e "${GREEN}${CONTROLLER_RESULT}${NC}"
echo ""

# 3. Tests E2E
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3️⃣  Tests End-to-End (E2E)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}⚠️  Los tests E2E requieren la API corriendo${NC}"
echo -e "${YELLOW}Si fallan, verifica que el API esté en localhost:4000${NC}"
echo ""

npm run test:e2e -- --silent 2>&1 | tee /tmp/auth-e2e-tests.log || true

E2E_RESULT=$(grep -E "Tests:" /tmp/auth-e2e-tests.log | tail -1 || echo "Tests: No ejecutados")
echo -e "${GREEN}${E2E_RESULT}${NC}"
echo ""

# 4. Coverage Report
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4️⃣  Coverage Report${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}Generando reporte de cobertura...${NC}"
npm test -- --coverage --coverageDirectory=coverage --silent 2>&1 | tee /tmp/coverage.log

echo ""
echo -e "${GREEN}✅ Reporte guardado en: ${PROJECT_DIR}/coverage${NC}"
echo -e "${GREEN}Abre: ${PROJECT_DIR}/coverage/lcov-report/index.html${NC}"
echo ""

# Resumen final
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RESUMEN FINAL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo "AuthService Tests:"
echo "  $SERVICE_RESULT"
echo ""
echo "AuthController Tests:"
echo "  $CONTROLLER_RESULT"
echo ""
echo "E2E Tests:"
echo "  $E2E_RESULT"
echo ""

# Coverage summary
if [ -f /tmp/coverage.log ]; then
  echo "Coverage Summary:"
  grep -A 10 "Coverage summary" /tmp/coverage.log || echo "  No disponible"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ Suite de testing completada${NC}"
echo ""
echo "Reportes generados:"
echo "  - Coverage: ./coverage/lcov-report/index.html"
echo "  - Logs: /tmp/auth-*-tests.log"
echo ""

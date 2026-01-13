#!/bin/bash
# Script de deployment para Conozca API
# Uso: ./scripts/deploy.sh [environment]

set -e  # Exit on error

ENVIRONMENT=${1:-production}
echo "🚀 Deploying to $ENVIRONMENT..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validar que estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Debe ejecutar este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Función para logging
log() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Validar variables de entorno
log "Validando variables de entorno..."
if [ ! -f ".env" ]; then
    error "Archivo .env no encontrado"
    warn "Copie .env.example a .env y configure los valores"
    exit 1
fi

# 2. Ejecutar tests
log "Ejecutando tests..."
cd apps/api
pnpm test || {
    error "Tests fallaron. Abortando deployment."
    exit 1
}
cd ../..

# 3. Build de la imagen Docker
log "Construyendo imagen Docker..."
docker build -t conozca-api:latest -f apps/api/Dockerfile . || {
    error "Build de Docker falló"
    exit 1
}

# 4. Tag con timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker tag conozca-api:latest conozca-api:$TIMESTAMP
log "Imagen taggeada: conozca-api:$TIMESTAMP"

# 5. Detener servicios existentes
log "Deteniendo servicios existentes..."
docker-compose down || warn "No hay servicios corriendo"

# 6. Iniciar servicios
log "Iniciando servicios..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose up -d postgres api
elif [ "$ENVIRONMENT" = "staging" ]; then
    docker-compose --profile staging up -d
else
    docker-compose --profile dev up -d
fi

# 7. Esperar a que la API esté lista
log "Esperando a que la API esté lista..."
RETRIES=30
WAIT_TIME=2
for i in $(seq 1 $RETRIES); do
    if curl -f -s http://localhost:3000/health > /dev/null; then
        log "API está respondiendo correctamente"
        break
    fi
    
    if [ $i -eq $RETRIES ]; then
        error "API no respondió después de $((RETRIES * WAIT_TIME)) segundos"
        docker-compose logs api
        exit 1
    fi
    
    echo -n "."
    sleep $WAIT_TIME
done

# 8. Verificar salud de los servicios
log "Verificando salud de los servicios..."
docker-compose ps

# 9. Mostrar logs recientes
log "Últimos logs de la API:"
docker-compose logs --tail=20 api

echo ""
log "🎉 Deployment completado exitosamente!"
echo ""
echo "📊 Servicios disponibles:"
echo "  - API:     http://localhost:3000"
echo "  - Health:  http://localhost:3000/health"
if [ "$ENVIRONMENT" != "production" ]; then
    echo "  - pgAdmin: http://localhost:5050"
fi
echo ""
echo "📝 Comandos útiles:"
echo "  - Ver logs:     docker-compose logs -f api"
echo "  - Reiniciar:    docker-compose restart api"
echo "  - Detener:      docker-compose down"
echo "  - Rollback:     ./scripts/rollback.sh"

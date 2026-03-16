#!/bin/bash
# Script de rollback para Conozca API

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "🔄 Iniciando rollback..."

# Listar imágenes disponibles
log "Imágenes disponibles:"
docker images conozca-api --format "table {{.Tag}}\t{{.CreatedAt}}" | head -n 10

# Solicitar tag al usuario
echo ""
read -p "Ingrese el tag de la imagen para rollback (o 'cancel' para cancelar): " TAG

if [ "$TAG" = "cancel" ] || [ -z "$TAG" ]; then
    warn "Rollback cancelado"
    exit 0
fi

# Verificar que la imagen existe
if ! docker images conozca-api:$TAG | grep -q $TAG; then
    error "Imagen conozca-api:$TAG no encontrada"
    exit 1
fi

# Detener servicios
log "Deteniendo servicios..."
docker-compose down

# Actualizar tag de latest
log "Actualizando tag latest a $TAG..."
docker tag conozca-api:$TAG conozca-api:latest

# Iniciar servicios
log "Iniciando servicios..."
docker-compose up -d postgres api

# Esperar health check
log "Esperando health check..."
sleep 10

for i in {1..30}; do
    if curl -f -s http://localhost:3000/health > /dev/null; then
        log "API está respondiendo correctamente"
        break
    fi
    
    if [ $i -eq 30 ]; then
        error "API no respondió después del rollback"
        docker-compose logs api
        exit 1
    fi
    
    echo -n "."
    sleep 2
done

log "🎉 Rollback completado exitosamente a versión $TAG"
docker-compose ps

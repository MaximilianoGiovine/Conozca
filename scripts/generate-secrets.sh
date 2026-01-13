#!/bin/bash
# Script para generar secrets seguros

echo "🔐 Generador de Secrets para Conozca"
echo ""

# Función para generar random string
generate_secret() {
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
}

echo "JWT_SECRET=$(generate_secret)"
echo "JWT_REFRESH_SECRET=$(generate_secret)"
echo ""
echo "POSTGRES_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, ''))")"
echo ""
echo "⚠️  IMPORTANTE: Guarda estos valores de forma segura y agrégalos a tu .env"
echo "⚠️  NO los commitees al repositorio"

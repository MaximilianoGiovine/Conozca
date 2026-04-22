#!/bin/bash
# Script para generar secrets seguros

echo "🔐 Generador de Secrets para Conozca"
echo ""

# Función para generar random string
generate_secret() {
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
}

generate_service_role_key() {
    SECRET="$1" node <<'NODE'
const crypto = require('crypto');

const secret = process.env.SECRET;
const header = { alg: 'HS256', typ: 'JWT' };
const payload = { role: 'service_role', iss: 'supabase' };

function base64Url(input) {
    return Buffer.from(JSON.stringify(input))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

const encodedHeader = base64Url(header);
const encodedPayload = base64Url(payload);
const message = `${encodedHeader}.${encodedPayload}`;
const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

console.log(`${message}.${signature}`);
NODE
}

echo "JWT_SECRET=$(generate_secret)"
echo "JWT_REFRESH_SECRET=$(generate_secret)"
echo ""
echo "POSTGRES_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, ''))")"
echo ""
echo "SUPABASE_SERVICE_ROLE_KEY=$(generate_service_role_key "$(generate_secret)")"
echo ""
echo "⚠️  IMPORTANTE: Guarda estos valores de forma segura y agrégalos a tu .env"
echo "⚠️  NO los commitees al repositorio"

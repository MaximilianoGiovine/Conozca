#!/bin/bash
# Ejecutar este script DENTRO de la consola de conozca-postgres.
# Soluciona forzadamente la ausencia del schema auth si initdb falló o fue omitido.

echo "========================================================="
echo "FORZANDO INICIALIZACIÓN DE SUPABASE EN BASE DE DATOS VIVA"
echo "========================================================="

cd /docker-entrypoint-initdb.d

# Ejecutar el script bash para configurar el usuario supabase_admin
echo "1. Ejecutando 000_init_roles.sh..."
chmod +x 000_init_roles.sh
./000_init_roles.sh

# Ejecutar los esquemas oficiales en orden forzado
echo "2. Ejecutando 001_initial-schema.sql..."
psql -U postgres -d postgres -f 001_initial-schema.sql

echo "3. Ejecutando 002_auth-schema.sql..."
psql -U postgres -d postgres -f 002_auth-schema.sql

echo "4. Ejecutando 003_storage-schema.sql..."
psql -U postgres -d postgres -f 003_storage-schema.sql

echo "5. Ejecutando 004_post-setup.sql..."
psql -U postgres -d postgres -f 004_post-setup.sql

# Ejecutar las migraciones del CMS
echo "6. Ejecutando migraciones propias (CMS)..."
psql -U postgres -d postgres -f 20260304000000_cms_schema.sql

echo "========================================================="
echo "¡INICIALIZACIÓN FORZADA COMPLETADA! REVISA ERRORES ARRIBA"
echo "========================================================="

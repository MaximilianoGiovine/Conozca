#!/bin/bash
# Ejecutar este script DENTRO de la consola de conozca-postgres.
# Soluciona forzadamente la ausencia del schema auth si initdb falló o fue omitido.

echo "========================================================="
echo "FORZANDO INICIALIZACIÓN DE SUPABASE EN BASE DE DATOS VIVA"
echo "========================================================="

cd /docker-entrypoint-initdb.d

echo "1. Descargando esquemas mágicos directos desde GitHub porque Portainer falló (Bypass de volúmenes) ..."
apt-get update && apt-get install -y curl ca-certificates
curl -s -o 000_init_roles.sh https://raw.githubusercontent.com/MaximilianoGiovine/Conozca/main/supabase/migrations/000_init_roles.sh
curl -s -o 001_initial-schema.sql https://raw.githubusercontent.com/MaximilianoGiovine/Conozca/main/supabase/migrations/001_initial-schema.sql
curl -s -o 002_auth-schema.sql https://raw.githubusercontent.com/MaximilianoGiovine/Conozca/main/supabase/migrations/002_auth-schema.sql
curl -s -o 003_storage-schema.sql https://raw.githubusercontent.com/MaximilianoGiovine/Conozca/main/supabase/migrations/003_storage-schema.sql
curl -s -o 004_post-setup.sql https://raw.githubusercontent.com/MaximilianoGiovine/Conozca/main/supabase/migrations/004_post-setup.sql
curl -s -o 20260304000000_cms_schema.sql https://raw.githubusercontent.com/MaximilianoGiovine/Conozca/main/supabase/migrations/20260304000000_cms_schema.sql

echo "2. Ejecutando 000_init_roles.sh..."
chmod +x 000_init_roles.sh
./000_init_roles.sh

# Usamos -h 127.0.0.1 para saltarnos el "Peer authentication" limitante de root
export PGPASSWORD="${POSTGRES_PASSWORD:-conozca_dev_password_change_me_in_vps}"
HOST_ARG="-h 127.0.0.1"

# Ejecutar los esquemas oficiales en orden forzado
echo "2. Ejecutando 001_initial-schema.sql..."
psql $HOST_ARG -U postgres -d postgres -f 001_initial-schema.sql

echo "3. Ejecutando 002_auth-schema.sql..."
psql $HOST_ARG -U postgres -d postgres -f 002_auth-schema.sql

echo "4. Ejecutando 003_storage-schema.sql..."
psql $HOST_ARG -U postgres -d postgres -f 003_storage-schema.sql

echo "5. Ejecutando 004_post-setup.sql..."
psql $HOST_ARG -U postgres -d postgres -f 004_post-setup.sql

# Ejecutar las migraciones del CMS
echo "6. Ejecutando migraciones propias (CMS)..."
psql $HOST_ARG -U postgres -d postgres -f 20260304000000_cms_schema.sql

echo "========================================================="
echo "¡INICIALIZACIÓN FORZADA COMPLETADA! REVISA ERRORES ARRIBA"
echo "========================================================="

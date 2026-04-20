#!/bin/bash
set -e

# ======================================================================================
# SCRIPT BASE DE MANTENIMIENTO: INICIALIZACIÓN DE ROLES SUPABASE
# ======================================================================================
# Este script se ejecuta internamente en el contenedor de Postgres para crear los roles
# básicos que Postgrest y GoTrue necesitan antes de conectarse. Usa la contraseña del entorno.
# ======================================================================================

# Usar el POSTGRES_PASSWORD definido en las variables de entorno, o el fallback.
ADMIN_PASS="${POSTGRES_PASSWORD:-conozca_dev_password_change_me_in_vps}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL

-- 1. Crear el usuario administrador de Supabase que requiere GoTrue
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin SUPERUSER LOGIN PASSWORD '${ADMIN_PASS}';
  END IF;
END \$\$;

-- 2. Crear los roles abstractos que PostgREST y GoTrue usan para context switching (RLS)
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END \$\$;

-- 3. Otorgar los permisos base en el schema public a los roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

EOSQL

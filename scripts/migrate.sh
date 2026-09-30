#!/bin/bash
# ======================================================================================
# Aplica las migraciones pendientes de supabase/migrations/ sobre la DB en Docker.
# ======================================================================================
# docker-entrypoint-initdb.d solo ejecuta las migraciones la PRIMERA vez que se crea el
# volumen de Postgres. Este script aplica las que se agreguen después, llevando registro
# en supabase_migrations.schema_migrations para no ejecutarlas dos veces.
#
# Solo gestiona los archivos con prefijo de timestamp (YYYYMMDDHHMMSS_nombre.sql).
# Los archivos de bootstrap (000_*, 001_*, ...) quedan a cargo del initdb.
#
# Uso (desde la raíz del proyecto, en el servidor):
#   ./scripts/migrate.sh                   Aplica las migraciones pendientes
#   ./scripts/migrate.sh --dry-run         Muestra cuáles se aplicarían, sin ejecutarlas
#   ./scripts/migrate.sh --baseline <file> Marca como aplicadas (sin ejecutarlas) todas
#                                          las migraciones hasta <file> inclusive.
#                                          Necesario la primera vez, en una DB existente.
#
# Variables opcionales:
#   PG_CONTAINER  Nombre del contenedor de Postgres (default: conozca-postgres)
# ======================================================================================

set -euo pipefail

PG_CONTAINER="${PG_CONTAINER:-conozca-postgres}"
MIGRATIONS_DIR="supabase/migrations"
MIGRATION_PATTERN='^[0-9]{14}_.+\.sql$'

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()   { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1" >&2; }

DRY_RUN=false
BASELINE=""
while [ $# -gt 0 ]; do
    case "$1" in
        --dry-run)  DRY_RUN=true; shift ;;
        --baseline) BASELINE="${2:-}"; shift 2 || { error "--baseline requiere un archivo"; exit 1; } ;;
        -h|--help)  sed -n '2,21p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
        *)          error "Argumento desconocido: $1"; exit 1 ;;
    esac
done

if [ ! -d "$MIGRATIONS_DIR" ]; then
    error "No se encontró $MIGRATIONS_DIR. Ejecutá el script desde la raíz del proyecto."
    exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$PG_CONTAINER"; then
    error "El contenedor '$PG_CONTAINER' no está corriendo."
    exit 1
fi

# psql dentro del contenedor, usando la contraseña de su propio entorno.
psql_exec() {
    docker exec -i "$PG_CONTAINER" sh -c \
        'PGPASSWORD="$POSTGRES_PASSWORD" psql -h 127.0.0.1 -U postgres -d postgres -v ON_ERROR_STOP=1 -q "$@"' \
        psql "$@"
}

# Lista ordenada de migraciones gestionadas.
MIGRATIONS=()
while IFS= read -r f; do
    MIGRATIONS+=("$f")
done < <(ls -1 "$MIGRATIONS_DIR" | grep -E "$MIGRATION_PATTERN" | sort)

TABLE_EXISTS=$(psql_exec -tAc "SELECT to_regclass('supabase_migrations.schema_migrations') IS NOT NULL")

# --- Baseline ------------------------------------------------------------------------
if [ -n "$BASELINE" ]; then
    BASELINE=$(basename "$BASELINE")
    if [ ! -f "$MIGRATIONS_DIR/$BASELINE" ] || ! echo "$BASELINE" | grep -qE "$MIGRATION_PATTERN"; then
        error "'$BASELINE' no es una migración válida de $MIGRATIONS_DIR."
        exit 1
    fi

    VALUES=""
    for f in "${MIGRATIONS[@]}"; do
        [[ "$f" > "$BASELINE" ]] && break
        VALUES+="${VALUES:+,}('$f')"
        echo "  baseline: $f"
    done

    if $DRY_RUN; then
        warn "Dry run: no se registró nada."
        exit 0
    fi

    psql_exec <<SQL
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
INSERT INTO supabase_migrations.schema_migrations (name) VALUES $VALUES
    ON CONFLICT (name) DO NOTHING;
SQL
    log "Baseline registrado hasta $BASELINE."
    exit 0
fi

if [ "$TABLE_EXISTS" != "t" ]; then
    error "Todavía no existe el registro de migraciones (supabase_migrations.schema_migrations)."
    echo "  Si la DB ya estaba inicializada, marcá primero las migraciones que ya tiene aplicadas:"
    echo "    ./scripts/migrate.sh --baseline <última_migración_ya_aplicada>.sql"
    echo "  Migraciones disponibles:"
    printf '    %s\n' "${MIGRATIONS[@]}"
    exit 1
fi

# --- Aplicar pendientes --------------------------------------------------------------
APPLIED=$(psql_exec -tAc "SELECT name FROM supabase_migrations.schema_migrations")

PENDING=()
for f in "${MIGRATIONS[@]}"; do
    grep -qx "$f" <<< "$APPLIED" || PENDING+=("$f")
done

if [ ${#PENDING[@]} -eq 0 ]; then
    log "La base de datos está al día. No hay migraciones pendientes."
    exit 0
fi

echo "Migraciones pendientes:"
printf '  %s\n' "${PENDING[@]}"

if $DRY_RUN; then
    warn "Dry run: no se aplicó nada."
    exit 0
fi

for f in "${PENDING[@]}"; do
    echo "→ Aplicando $f..."
    # Migración + registro en una única transacción: si falla, no queda nada a medias.
    { cat "$MIGRATIONS_DIR/$f"; echo; echo "INSERT INTO supabase_migrations.schema_migrations (name) VALUES ('$f');"; } \
        | psql_exec --single-transaction || { error "Falló $f. Se revirtió; las siguientes no se aplicaron."; exit 1; }
    log "$f aplicada."
done

# PostgREST cachea el esquema: sin esto no ve las columnas/tablas nuevas.
psql_exec -c "NOTIFY pgrst, 'reload schema';"
log "Esquema de PostgREST recargado."

log "${#PENDING[@]} migración(es) aplicada(s)."

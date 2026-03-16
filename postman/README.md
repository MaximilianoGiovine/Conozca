# Postman Assets

Colección y environments listos para importar en Postman.

## Archivos
- Colección: ConozcaAPI.postman_collection.json
- Env local: ConozcaAPI.postman_environment.json (http://localhost:4000)
- Env staging: ConozcaAPI.postman_environment.staging.json (https://staging-api.conozca.org)
- Env producción: ConozcaAPI.postman_environment.production.json (https://api.conozca.org)

## Uso rápido
1. Importa la colección y el environment deseado.
2. Ejecuta `Auth / POST /auth/login` para obtener tokens.
3. Copia `access_token` y `refresh_token` en las variables del environment.
4. Prueba los endpoints protegidos (Articles, Categories, Authors) con el header de autorización ya inyectado.

## Notas
- Algunos endpoints (POST/PUT/PATCH/DELETE) requieren roles específicos (EDITOR/ADMIN).
- Respeta los rate limits configurados.

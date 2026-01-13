# Integration Guides

Guías prácticas para consumir la API de Conozca desde aplicaciones web (React/Next.js) y servicios Node.

## Base URLs y Auth

- API local: `http://localhost:4000`
- Swagger: `http://localhost:4000/api/docs`
- Auth: Bearer JWT en header `Authorization: Bearer <access_token>`
- Tokens: access (15m) + refresh (7d)

## Axios: cliente con refresh automático

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error;
    if (response?.status !== 401 || config._retry) throw error;

    if (!refreshPromise) {
      refreshPromise = fetch(`${api.defaults.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: localStorage.getItem('refresh_token') }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(r)))
        .then((data) => {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          return data.access_token;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newToken = await refreshPromise;
    config._retry = true;
    config.headers.Authorization = `Bearer ${newToken}`;
    return api(config);
  },
);

export default api;
```

## Next.js (App Router): llamadas desde server components

```typescript
// app/articles/page.tsx
async function getArticles() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
}

export default async function ArticlesPage() {
  const data = await getArticles();
  return (
    <main>
      <h1>Artículos</h1>
      <ul>
        {data.items.map((item: any) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

## Next.js (Pages Router): SSR con token en cookie HttpOnly

```typescript
// pages/protected.tsx
import { GetServerSideProps } from 'next';

type Article = { id: string; title: string };

type Props = { items: Article[] };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const token = ctx.req.cookies['access_token'];
  if (!token) return { redirect: { destination: '/login', permanent: false } };

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) return { redirect: { destination: '/login', permanent: false } };
  const data = await res.json();

  return { props: { items: data.items } };
};

export default function ProtectedPage({ items }: Props) {
  return (
    <div>
      <h1>Artículos (protegido)</h1>
      <ul>{items.map((a) => <li key={a.id}>{a.title}</li>)}</ul>
    </div>
  );
}
```

## Manejo de sesión en frontend

- Guarda `access_token` en memoria/localStorage; evita cookies no HttpOnly para tokens largos.
- Guarda `refresh_token` en cookie HttpOnly + Secure cuando uses dominio propio (recomendado) o en localStorage sólo en entornos controlados.
- Renovación: usar endpoint `/auth/refresh` antes de que expire el access token.
- Logout: llamar `/auth/logout` y limpiar storage/cookies.

## Llamadas públicas vs privadas

- Públicas (sin auth): `GET /articles`, `GET /articles/:slugOrId`, `GET /articles/categories`, `GET /articles/authors`.
- Privadas (JWT): crear/editar/eliminar artículos, bloques, categorías y autores.

## Errores comunes y cómo tratarlos

- `401 Unauthorized`: refrescar token o redirigir a login.
- `403 Forbidden`: falta de rol (USER/EDITOR/ADMIN); mostrar mensaje o bloquear UI.
- `429 Too Many Requests`: aplicar backoff y mostrar aviso de rate limit.
- `400 Bad Request`: validar DTOs antes de enviar (usa los ejemplos de Swagger).

## Rate limiting y buenas prácticas

- Respeta los límites por endpoint (p. ej. register 3/min, login 5/min).
- Implementa retry con backoff exponencial sólo para 5xx/429.
- Cachea llamadas públicas (listados) si tu caso de uso lo permite.

## Env vars sugeridas (frontend)

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Testing rápido con curl

```bash
# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Crear artículo (requiere EDITOR/ADMIN)
curl -X POST http://localhost:4000/articles \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi artículo",
    "slug": "mi-articulo",
    "content": "Contenido con más de 50 caracteres...",
    "authorId": "<AUTHOR_ID>",
    "categoryId": "<CATEGORY_ID>",
    "status": "DRAFT"
  }'
```

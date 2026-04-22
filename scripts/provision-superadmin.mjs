import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'y', 'on'].includes(String(value).toLowerCase());
}

function requireEnv(name, fallback = '') {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }

  return value;
}

function shouldUseSsl(connectionString) {
  try {
    const url = new URL(connectionString);
    return url.hostname.includes('supabase.co');
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureSchemaExists(db, schemaName) {
  const rows = await db`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.schemata
      WHERE schema_name = ${schemaName}
    ) AS exists
  `;

  return Boolean(rows[0]?.exists);
}

async function ensureTableExists(db, schemaName, tableName) {
  const rows = await db`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = ${schemaName}
        AND table_name = ${tableName}
    ) AS exists
  `;

  return Boolean(rows[0]?.exists);
}

async function getTableColumns(db, schemaName, tableName) {
  const rows = await db`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = ${schemaName}
      AND table_name = ${tableName}
    ORDER BY ordinal_position
  `;

  return rows.map((row) => row.column_name);
}

async function getExistingUserByEmail(db, email) {
  const rows = await db`
    SELECT id, email, raw_user_meta_data
    FROM auth.users
    WHERE email = ${email}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

async function ensureAuthTrigger(db) {
  await db`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.users (id, email, full_name, avatar_url)
      VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
      )
      ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
            avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);

      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'user')
      ON CONFLICT (user_id) DO NOTHING;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  await db`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`;
  await db`
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `;
}

async function provisionAuthUser(db, email, password, fullName) {
  const existingUser = await getExistingUserByEmail(db, email);
  const authUsersColumns = await getTableColumns(db, 'auth', 'users');
  const confirmedColumn = authUsersColumns.includes('email_confirmed_at')
    ? 'email_confirmed_at'
    : 'confirmed_at';
  const hasIdentities = await ensureTableExists(db, 'auth', 'identities');

  if (existingUser) {
    const updateQuery = confirmedColumn === 'email_confirmed_at'
      ? db`
          UPDATE auth.users
          SET raw_user_meta_data = jsonb_build_object('full_name', ${fullName}),
              updated_at = NOW(),
              email_confirmed_at = NOW()
          WHERE id = ${existingUser.id}
        `
      : db`
          UPDATE auth.users
          SET raw_user_meta_data = jsonb_build_object('full_name', ${fullName}),
              updated_at = NOW(),
              confirmed_at = NOW()
          WHERE id = ${existingUser.id}
        `;

    await updateQuery;

    return existingUser;
  }

  const rows = confirmedColumn === 'email_confirmed_at'
    ? await db`
        WITH inserted_user AS (
          INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
          )
          VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            ${email},
            crypt(${password}, gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            ${JSON.stringify({ full_name: fullName })}::jsonb,
            NOW(),
            NOW()
          )
          ON CONFLICT (email) DO UPDATE
            SET encrypted_password = EXCLUDED.encrypted_password,
                raw_app_meta_data = EXCLUDED.raw_app_meta_data,
                raw_user_meta_data = EXCLUDED.raw_user_meta_data,
                updated_at = NOW()
          RETURNING id, email, raw_user_meta_data
        )
        SELECT * FROM inserted_user
      `
    : await db`
        WITH inserted_user AS (
          INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
          )
          VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            ${email},
            crypt(${password}, gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            ${JSON.stringify({ full_name: fullName })}::jsonb,
            NOW(),
            NOW()
          )
          ON CONFLICT (email) DO UPDATE
            SET encrypted_password = EXCLUDED.encrypted_password,
                raw_app_meta_data = EXCLUDED.raw_app_meta_data,
                raw_user_meta_data = EXCLUDED.raw_user_meta_data,
                updated_at = NOW()
          RETURNING id, email, raw_user_meta_data
        )
        SELECT * FROM inserted_user
      `;

  if (hasIdentities && rows[0]) {
    await db`
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        ${rows[0].id},
        ${JSON.stringify({ sub: rows[0].id, email })}::jsonb,
        'email',
        ${rows[0].id}::text,
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING
    `;
  }

  return rows[0];
}

async function syncCmsUser(db, user, fullName, dryRun) {
  if (dryRun) {
    console.log('[dry-run] Se omite la escritura en public.users y public.user_roles');
    return;
  }

  await db`
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
      ${user.id},
      ${user.email},
      ${fullName},
      ${user.user_metadata?.avatar_url ?? null}
    )
    ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
          avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url)
  `;

  await db`
    INSERT INTO public.user_roles (user_id, role)
    VALUES (${user.id}, 'superadmin')
    ON CONFLICT (user_id) DO UPDATE
      SET role = EXCLUDED.role
  `;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const email = requireEnv('SUPERADMIN_EMAIL');
  const password = requireEnv('SUPERADMIN_PASSWORD');
  const fullName = requireEnv('SUPERADMIN_FULL_NAME', 'Superadmin');
  const dryRun = parseBoolean(process.env.SUPERADMIN_DRY_RUN, false);

  requireEnv('DATABASE_URL', databaseUrl);

  const db = postgres(databaseUrl, {
    max: 1,
    connect_timeout: 10,
    ssl: shouldUseSsl(databaseUrl) ? 'require' : undefined,
  });

  try {
    const maxAttempts = parseInt(process.env.SUPERADMIN_BOOTSTRAP_ATTEMPTS ?? '30', 10);
    const attemptDelayMs = parseInt(process.env.SUPERADMIN_BOOTSTRAP_DELAY_MS ?? '2000', 10);

    let authSchemaReady = false;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      authSchemaReady = await ensureSchemaExists(db, 'auth') && await ensureTableExists(db, 'auth', 'users');

      if (authSchemaReady) {
        break;
      }

      console.log(`Esperando schema auth... intento ${attempt}/${maxAttempts}`);
      await sleep(attemptDelayMs);
    }

    if (!authSchemaReady) {
      throw new Error('El schema auth no estuvo disponible a tiempo. Revisa que las migraciones iniciales se hayan ejecutado.');
    }

    const publicUsersExists = await ensureTableExists(db, 'public', 'users');
    const userRolesExists = await ensureTableExists(db, 'public', 'user_roles');

    if (!publicUsersExists || !userRolesExists) {
      throw new Error('Faltan public.users o public.user_roles. Aplica primero la migración del CMS.');
    }

    await ensureAuthTrigger(db);

    const user = await provisionAuthUser(db, email, password, fullName);

    if (dryRun) {
      console.log('[dry-run] Usuario Auth detectado o preparado:', user.id);
      return;
    }

    await syncCmsUser(db, user, fullName, false);

    const rows = await db`
      SELECT u.id, u.email, r.role
      FROM public.users u
      JOIN public.user_roles r ON r.user_id = u.id
      WHERE u.id = ${user.id}
    `;

    console.log('Superadmin provisionado con Auth correctamente');
    console.log(rows[0] ?? { id: user.id, email: user.email, role: 'superadmin' });
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error('Error al provisionar superadmin con Auth');
  console.error(error.message);
  process.exit(1);
});
-- ======================================================================================
-- SCRIPT DE INYECCIÓN DIRECTA DE SUPERADMIN Y TRIGGERS (SaaS Factory V3)
-- Ejecutar en PostgreSQL (conozca-postgres) DESPUÉS de que el sistema esté corriendo.
-- ======================================================================================

BEGIN;

-- 1. Restaurar el Trigger que conecta GoTrue con nuestro CMS genérico.
-- (Este trigger no podía estar en las migraciones de inicio porque causa dependencia circular)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  -- Default to 'user' role automatically
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Inyectar el Súper Usuario directamente en GoTrue.
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'makisaurio@conozca.com',
    crypt('MakisaurioRex.2287', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Makisaurio"}',
    NOW(),
    NOW()
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    format('{"sub":"%s","email":"%s"}', new_user_id::text, 'makisaurio@conozca.com')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  -- 3. Forzar nivel de permisos elevados a superadmin en el schema público (CMS)
  UPDATE public.user_roles 
  SET role = 'superadmin'
  WHERE user_id = new_user_id;

END $$;

COMMIT;

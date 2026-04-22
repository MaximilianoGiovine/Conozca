-- ======================================================================================
-- Fallback manual para superadmin con Supabase Auth
-- Requiere que el schema auth ya exista y que el usuario haya sido creado por GoTrue
-- o por scripts/provision-superadmin.mjs.
-- ======================================================================================

BEGIN;

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

INSERT INTO public.users (id, email, full_name, avatar_url)
SELECT
  id,
  email,
  'Makisaurio',
  NULL
FROM auth.users
WHERE email = 'makisaurio@conozca.com'
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin'
FROM auth.users
WHERE email = 'makisaurio@conozca.com'
ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role;

COMMIT;

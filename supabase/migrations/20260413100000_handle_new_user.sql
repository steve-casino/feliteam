-- Auto-create a public.users row whenever a new auth.users row is inserted.
-- New signups default to the 'intake_agent' role. Admins can promote via
-- /admin. Metadata keys `full_name` and `role` on the auth user are honored
-- when present (e.g., when an admin creates via admin.auth.admin.createUser).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_role text;
  meta_name text;
  resolved_role user_role;
BEGIN
  meta_role := NEW.raw_user_meta_data ->> 'role';
  meta_name := NEW.raw_user_meta_data ->> 'full_name';

  BEGIN
    resolved_role := COALESCE(meta_role, 'intake_agent')::user_role;
  EXCEPTION WHEN OTHERS THEN
    resolved_role := 'intake_agent'::user_role;
  END;

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(meta_name, NEW.email),
    resolved_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

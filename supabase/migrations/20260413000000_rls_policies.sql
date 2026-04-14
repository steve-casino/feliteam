-- InjuryFlow RLS policies & DB-generated case numbers
-- Safe to run after supabase/schema.sql. Drops prior policies with the same
-- names and re-creates them per the role model:
--   * users: read/write own row
--   * case_managers: read/write cases assigned to them
--   * admins: read/write everything

-- ===== CASE NUMBER SEQUENCE =====

CREATE SEQUENCE IF NOT EXISTS cases_case_number_seq START 100001;

ALTER TABLE cases
  ALTER COLUMN case_number
  SET DEFAULT ('IF-' || LPAD(nextval('cases_case_number_seq')::text, 6, '0'));

-- ===== HELPER: read role without RLS recursion =====

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, anon;

-- ===== ENABLE RLS (idempotent) =====

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ===== USERS =====

DROP POLICY IF EXISTS "users_select_self" ON users;
DROP POLICY IF EXISTS "users_update_self" ON users;
DROP POLICY IF EXISTS "users_read" ON users;
DROP POLICY IF EXISTS "users_update" ON users;
DROP POLICY IF EXISTS "users_admin_all" ON users;

-- Anyone authenticated can read the users directory (needed for assignment UI,
-- case manager lookups, leaderboard). Only self or admin can update.
CREATE POLICY "users_read" ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "users_update" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.current_user_role() = 'admin')
  WITH CHECK (auth.uid() = id OR public.current_user_role() = 'admin');

CREATE POLICY "users_admin_all" ON users
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- ===== CASES =====

DROP POLICY IF EXISTS "cases_select" ON cases;
DROP POLICY IF EXISTS "cases_insert_case_manager" ON cases;
DROP POLICY IF EXISTS "cases_update" ON cases;
DROP POLICY IF EXISTS "cases_read" ON cases;
DROP POLICY IF EXISTS "cases_insert" ON cases;
DROP POLICY IF EXISTS "cases_write" ON cases;
DROP POLICY IF EXISTS "cases_admin_all" ON cases;

-- Admins see everything; case_managers see their assigned cases.
CREATE POLICY "cases_read" ON cases
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'admin'
    OR assigned_case_manager_id = auth.uid()
    OR assigned_medical_manager_id = auth.uid()
  );

-- Intake agents, case managers, and admins can create cases.
CREATE POLICY "cases_insert" ON cases
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() IN ('admin', 'case_manager', 'intake_agent')
  );

-- Admins update everything; case_managers update their assigned cases.
CREATE POLICY "cases_write" ON cases
  FOR UPDATE TO authenticated
  USING (
    public.current_user_role() = 'admin'
    OR assigned_case_manager_id = auth.uid()
  )
  WITH CHECK (
    public.current_user_role() = 'admin'
    OR assigned_case_manager_id = auth.uid()
  );

CREATE POLICY "cases_admin_all" ON cases
  FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- ===== CASE NOTES =====

DROP POLICY IF EXISTS "case_notes_select" ON case_notes;
DROP POLICY IF EXISTS "case_notes_insert" ON case_notes;
DROP POLICY IF EXISTS "case_notes_read" ON case_notes;
DROP POLICY IF EXISTS "case_notes_write" ON case_notes;

CREATE POLICY "case_notes_read" ON case_notes
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_notes.case_id
        AND cases.assigned_case_manager_id = auth.uid()
    )
  );

CREATE POLICY "case_notes_write" ON case_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      public.current_user_role() = 'admin'
      OR EXISTS (
        SELECT 1 FROM cases
        WHERE cases.id = case_notes.case_id
          AND cases.assigned_case_manager_id = auth.uid()
      )
    )
  );

-- ===== NOTIFICATIONS =====

DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;
DROP POLICY IF EXISTS "notifications_delete" ON notifications;

CREATE POLICY "notifications_own" ON notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.current_user_role() = 'admin')
  WITH CHECK (user_id = auth.uid() OR public.current_user_role() = 'admin');

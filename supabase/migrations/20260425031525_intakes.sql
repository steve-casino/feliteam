-- ============================================================
-- Intakes table — short-form leads submitted by Reps, reviewed
-- by Case Managers. Replaces the localStorage 'opportunities'
-- store. Includes the new status workflow + draft support.
-- ============================================================

-- ===== ENUM =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'intake_status') THEN
    CREATE TYPE intake_status AS ENUM (
      'draft',          -- saved mid-flow, not yet submitted
      'not_signed',     -- submitted by rep, not yet signed by client
      'chase',          -- aged-out 'not_signed' (computed at read time)
      'scheduled',      -- a meeting / signing is on the calendar
      'under_review',   -- flagged for case-manager review
      'signed',         -- client signed (= a signup)
      'did_not_sign',   -- client confirmed they will not sign
      'rejected'        -- case managers decided not to take the case
    );
  END IF;
END$$;

-- ===== TABLE =====
CREATE TABLE IF NOT EXISTS intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Form fields (the 9 the rep collects)
  full_name TEXT NOT NULL DEFAULT '',
  current_address TEXT,
  phone TEXT,
  emergency_phone TEXT,
  email TEXT,
  dob DATE,
  ssn_last4 TEXT,
  marital_status TEXT,
  country_of_birth TEXT,

  -- Workflow
  status intake_status NOT NULL DEFAULT 'not_signed',
  scheduled_at TIMESTAMPTZ,
  scheduled_note TEXT,

  -- Provenance
  submitted_by_rep_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Save & Resume — full form snapshot lives here while a draft is
  -- in flight. Cleared when the intake is submitted.
  is_draft BOOLEAN NOT NULL DEFAULT false,
  draft_data JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signed_at TIMESTAMPTZ
);

-- Keep updated_at fresh.
CREATE OR REPLACE FUNCTION public.touch_intakes_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  IF NEW.status = 'signed' AND (OLD.signed_at IS NULL OR NEW.status <> OLD.status) THEN
    NEW.signed_at := COALESCE(NEW.signed_at, NOW());
  END IF;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS intakes_touch_updated_at ON intakes;
CREATE TRIGGER intakes_touch_updated_at
  BEFORE UPDATE ON intakes
  FOR EACH ROW EXECUTE FUNCTION public.touch_intakes_updated_at();

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS intakes_status_created_at_idx
  ON intakes (status, created_at DESC);
CREATE INDEX IF NOT EXISTS intakes_rep_idx
  ON intakes (submitted_by_rep_id);
CREATE INDEX IF NOT EXISTS intakes_scheduled_at_idx
  ON intakes (scheduled_at)
  WHERE status = 'scheduled';

-- ===== RLS =====
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;

-- Drop prior policies so this migration is re-runnable.
DROP POLICY IF EXISTS "intakes_select_rep_own" ON intakes;
DROP POLICY IF EXISTS "intakes_select_managers_all" ON intakes;
DROP POLICY IF EXISTS "intakes_insert_rep" ON intakes;
DROP POLICY IF EXISTS "intakes_update_rep_own_draft" ON intakes;
DROP POLICY IF EXISTS "intakes_update_managers" ON intakes;
DROP POLICY IF EXISTS "intakes_delete_rep_own_draft" ON intakes;

-- Reps can SELECT only their own.
CREATE POLICY "intakes_select_rep_own" ON intakes
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'intake_agent'
    AND submitted_by_rep_id = auth.uid()
  );

-- Case managers and admins can SELECT everything.
CREATE POLICY "intakes_select_managers_all" ON intakes
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() IN ('case_manager', 'admin')
  );

-- Reps can INSERT their own intakes (drafts or final).
CREATE POLICY "intakes_insert_rep" ON intakes
  FOR INSERT TO authenticated
  WITH CHECK (
    submitted_by_rep_id = auth.uid()
  );

-- Reps can UPDATE only their own *drafts*. Once submitted, the row is
-- read-only to them — only managers can move status.
CREATE POLICY "intakes_update_rep_own_draft" ON intakes
  FOR UPDATE TO authenticated
  USING (
    submitted_by_rep_id = auth.uid() AND is_draft = true
  )
  WITH CHECK (
    submitted_by_rep_id = auth.uid()
  );

-- Case managers and admins can UPDATE any intake (status changes etc).
CREATE POLICY "intakes_update_managers" ON intakes
  FOR UPDATE TO authenticated
  USING (
    public.current_user_role() IN ('case_manager', 'admin')
  )
  WITH CHECK (
    public.current_user_role() IN ('case_manager', 'admin')
  );

-- Reps can DELETE their own drafts (e.g. discard a saved draft).
CREATE POLICY "intakes_delete_rep_own_draft" ON intakes
  FOR DELETE TO authenticated
  USING (
    submitted_by_rep_id = auth.uid() AND is_draft = true
  );

-- ===== REALTIME =====
-- Make sure the supabase_realtime publication includes this table so the
-- dashboard can subscribe to changes.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'intakes'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE intakes';
  END IF;
END$$;

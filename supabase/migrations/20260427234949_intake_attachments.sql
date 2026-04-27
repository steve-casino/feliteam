-- ============================================================
-- Intake attachments — files uploaded by Reps with a baby intake
-- (photos, IDs, insurance docs, scans, anything). Stored in a
-- private Supabase Storage bucket; metadata lives in this table.
--
-- Storage path pattern:
--   intake-attachments/<intake_id>/<random>-<original_filename>
--
-- Idempotent — safe to re-run.
-- ============================================================

-- ===== METADATA TABLE =====
CREATE TABLE IF NOT EXISTS intake_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS intake_attachments_intake_idx
  ON intake_attachments(intake_id);

-- ===== TABLE RLS =====
ALTER TABLE intake_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "intake_attachments_select_managers" ON intake_attachments;
DROP POLICY IF EXISTS "intake_attachments_select_rep_own" ON intake_attachments;
DROP POLICY IF EXISTS "intake_attachments_insert_rep_own" ON intake_attachments;
DROP POLICY IF EXISTS "intake_attachments_delete_rep_own" ON intake_attachments;
DROP POLICY IF EXISTS "intake_attachments_delete_managers" ON intake_attachments;

-- Managers + admins can read all attachments.
CREATE POLICY "intake_attachments_select_managers" ON intake_attachments
  FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('case_manager', 'admin'));

-- Reps can read attachments on their own intakes.
CREATE POLICY "intake_attachments_select_rep_own" ON intake_attachments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM intakes i
      WHERE i.id = intake_attachments.intake_id
        AND i.submitted_by_rep_id = auth.uid()
    )
  );

-- Reps can attach files to their own intakes (drafts or submitted).
CREATE POLICY "intake_attachments_insert_rep_own" ON intake_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM intakes i
      WHERE i.id = intake_attachments.intake_id
        AND i.submitted_by_rep_id = auth.uid()
    )
  );

-- Reps can delete their own attachments while the intake is still
-- a draft. Once submitted, only managers can delete.
CREATE POLICY "intake_attachments_delete_rep_own" ON intake_attachments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM intakes i
      WHERE i.id = intake_attachments.intake_id
        AND i.submitted_by_rep_id = auth.uid()
        AND i.is_draft = true
    )
  );

CREATE POLICY "intake_attachments_delete_managers" ON intake_attachments
  FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('case_manager', 'admin'));

-- ===== STORAGE BUCKET =====
-- Private bucket — downloads go through signed URLs from the client.
INSERT INTO storage.buckets (id, name, public)
VALUES ('intake-attachments', 'intake-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- ===== STORAGE BUCKET RLS =====
-- We trust the metadata table for fine-grained access; here we just
-- require the user to be authenticated and constrain reads/writes to
-- this bucket. Path-prefix checks are enforced by the app layer
-- (always prefix with the intake's UUID).

DROP POLICY IF EXISTS "intake_attachments_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "intake_attachments_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "intake_attachments_storage_delete" ON storage.objects;

CREATE POLICY "intake_attachments_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'intake-attachments');

CREATE POLICY "intake_attachments_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'intake-attachments');

CREATE POLICY "intake_attachments_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'intake-attachments');

-- ===== REALTIME (so the manager sees rep-added files live) =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'intake_attachments'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE intake_attachments';
  END IF;
END$$;

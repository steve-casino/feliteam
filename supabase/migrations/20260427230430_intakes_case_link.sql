-- ============================================================
-- Link an intake to the Case it became.
-- When a Case Manager opens a baby intake from the dashboard,
-- fills out the full intake form, and submits, we INSERT a row
-- into `cases` and stamp the new case's id on the source intake.
-- That makes the relationship navigable in either direction:
--   intake.case_id  → cases.id  (one signed intake → one case)
--   cases ← intakes (lookup intake from a case via the FK)
--
-- Idempotent — safe to re-run.
-- ============================================================

ALTER TABLE intakes
  ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES cases(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS intakes_case_id_idx ON intakes(case_id);

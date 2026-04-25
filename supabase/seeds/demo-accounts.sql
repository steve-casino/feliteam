-- ============================================================
-- Demo accounts seed
-- ============================================================
-- Run ONCE in Supabase Dashboard → SQL Editor → New Query.
-- Idempotent: safe to re-run; existing accounts are left alone.
--
-- Why direct inserts instead of supabase.auth.signUp()?
-- The auth.signUp endpoint is rate-limited (default: small handful of
-- requests per hour per IP), which is why the "Try as demo" button was
-- failing under repeated clicks. Inserting straight into the auth
-- schema bypasses the rate limiter entirely.
--
-- After this seeds successfully, the demo login button just calls
-- signInWithPassword — no further setup needed, no rate-limit windows
-- to wait out.
--
-- Credentials seeded:
--   Manager:  demo.manager@felicetti-team.app / FelicettiDemo2026!
--   Rep:      demo.rep@felicetti-team.app     / FelicettiDemo2026!
-- ============================================================

DO $$
DECLARE
  v_manager_id UUID;
  v_rep_id UUID;
  v_pw_hash TEXT;
BEGIN
  -- pgcrypto is enabled by default in Supabase, but be safe.
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  v_pw_hash := crypt('FelicettiDemo2026!', gen_salt('bf'));

  -- ─── Manager ────────────────────────────────────────────────
  SELECT id INTO v_manager_id FROM auth.users
    WHERE email = 'demo.manager@felicetti-team.app';
  IF v_manager_id IS NULL THEN
    v_manager_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_manager_id,
      'authenticated', 'authenticated',
      'demo.manager@felicetti-team.app',
      v_pw_hash,
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Manager","role":"case_manager"}'::jsonb,
      NOW(), NOW(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_manager_id::text,
      v_manager_id,
      jsonb_build_object(
        'sub', v_manager_id::text,
        'email', 'demo.manager@felicetti-team.app',
        'email_verified', true
      ),
      'email',
      NOW(), NOW(), NOW()
    );
  END IF;

  -- ─── Rep ────────────────────────────────────────────────────
  SELECT id INTO v_rep_id FROM auth.users
    WHERE email = 'demo.rep@felicetti-team.app';
  IF v_rep_id IS NULL THEN
    v_rep_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_rep_id,
      'authenticated', 'authenticated',
      'demo.rep@felicetti-team.app',
      v_pw_hash,
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      -- Map app role 'case_rep' → DB role 'intake_agent'
      '{"full_name":"Demo Rep","role":"intake_agent"}'::jsonb,
      NOW(), NOW(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_rep_id::text,
      v_rep_id,
      jsonb_build_object(
        'sub', v_rep_id::text,
        'email', 'demo.rep@felicetti-team.app',
        'email_verified', true
      ),
      'email',
      NOW(), NOW(), NOW()
    );
  END IF;
END$$;

-- Verify — should return two rows.
SELECT email, raw_user_meta_data->>'role' AS role, email_confirmed_at IS NOT NULL AS confirmed
FROM auth.users
WHERE email IN (
  'demo.manager@felicetti-team.app',
  'demo.rep@felicetti-team.app'
);

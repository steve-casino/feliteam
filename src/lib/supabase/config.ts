/**
 * Public Supabase config — URL + anon key.
 *
 * These are PUBLIC values by design. They ship in the client bundle
 * regardless of how they get there; the actual security boundary is
 * Row-Level Security on the database, not the secrecy of these strings.
 *
 * We define them as constants AND read from `process.env`. The env
 * value wins if it's present (that's the right behavior for staging
 * vs prod separation), but if env loading fails for any reason — stale
 * Vercel build cache, missing `.env.local`, weird HMR state, edge
 * runtime quirks — the constant kicks in and the app keeps working.
 *
 * If you ever rotate the anon key in the Supabase dashboard, update the
 * constant below to match.
 *
 * The SERVICE_ROLE_KEY is genuinely secret and is NOT included here —
 * see admin.ts.
 */

const FALLBACK_SUPABASE_URL = 'https://cxdjwzgdopspocwjnxec.supabase.co'

const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4ZGp3emdkb3BzcG9jd2pueGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTcxMDAsImV4cCI6MjA5MTU5MzEwMH0.IGKw-GZofQOfZbOr3iuHk_O6dQKu17X3AutUnVl9aow'

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : FALLBACK_SUPABASE_URL

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : FALLBACK_SUPABASE_ANON_KEY

import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { User } from '@/types'
import { createClient as createServerScopedClient } from './server'

const SYNTHETIC_DEV_ID = '00000000-0000-0000-0000-000000000000'

function syntheticProfile(id: string, email: string): User {
  return {
    id,
    email,
    full_name: 'Dev User',
    role: 'admin',
    xp_points: 0,
    level: 1,
    created_at: new Date().toISOString(),
  }
}

type AdminClient = ReturnType<typeof createSupabaseClient>

/**
 * Builds the service-role admin client if env is present, else null.
 * We deliberately don't throw so builds can succeed without live env vars
 * (e.g. when Vercel prerenders dynamic pages at build time without secrets).
 */
function tryCreateAdminClient(): AdminClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Testing-mode context helper.
 *
 * Returns a Supabase client and "effective user" that lets protected pages and
 * server actions work WITHOUT an authenticated session.
 *
 * - `db`: service-role admin client (bypasses RLS). All reads/writes use it so
 *   the app is usable without login.
 * - `userId` / `profile`: real authed user if a session exists, otherwise the
 *   first row in `public.users`, otherwise a synthetic stub.
 *
 * If the admin client can't be built (missing env), `db` is a no-op stub that
 * returns empty data for reads and an error for writes. This keeps the build
 * green; the error message surfaces at request time instead of build time.
 */
export async function getContext(): Promise<{
  userId: string
  profile: User
  db: AdminClient
  isAuthed: boolean
}> {
  const real = tryCreateAdminClient()
  const db = (real ?? createStubClient()) as AdminClient

  if (real) {
    try {
      const server = await createServerScopedClient()
      const {
        data: { user },
      } = await server.auth.getUser()
      if (user) {
        const { data: profile } = await real
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        const resolved =
          (profile as User | null) ??
          syntheticProfile(user.id, user.email ?? 'user@example.com')
        return { userId: user.id, profile: resolved, db, isAuthed: true }
      }

      const { data: first } = await real
        .from('users')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (first) {
        const firstUser = first as User
        return { userId: firstUser.id, profile: firstUser, db, isAuthed: false }
      }
    } catch {
      // fall through to synthetic
    }
  }

  return {
    userId: SYNTHETIC_DEV_ID,
    profile: syntheticProfile(SYNTHETIC_DEV_ID, 'dev@example.com'),
    db,
    isAuthed: false,
  }
}

// Minimal stand-in for the admin client when env isn't available. Chainable
// query builder that resolves to empty data / explanatory error.
function createStubClient(): unknown {
  const envErr = {
    message:
      'Supabase service role is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
  }
  const emptyRead = Promise.resolve({ data: [], error: null })
  const emptyMaybe = Promise.resolve({ data: null, error: null })
  const writeErr = Promise.resolve({ data: null, error: envErr })

  const builder: Record<string, unknown> = {}
  const chain = () => builder
  for (const method of [
    'select',
    'eq',
    'neq',
    'in',
    'order',
    'limit',
    'range',
    'ilike',
    'gte',
    'lte',
    'match',
    'not',
    'or',
  ]) {
    builder[method] = chain
  }
  builder.maybeSingle = () => emptyMaybe
  builder.single = () => emptyMaybe
  builder.insert = () => ({ ...builder, select: chain, single: () => writeErr })
  builder.update = () => ({ ...builder, select: chain })
  builder.upsert = () => writeErr
  builder.delete = () => writeErr
  // Make the builder itself thenable for `await db.from(...).select(...)` style.
  ;(builder as Record<string, unknown>).then = (
    resolve: (r: unknown) => void
  ) => emptyRead.then(resolve)

  return {
    from: () => builder,
    auth: {
      admin: {
        createUser: async () => ({ data: { user: null }, error: envErr }),
        updateUserById: async () => ({ data: null, error: envErr }),
        deleteUser: async () => ({ data: null, error: envErr }),
      },
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }
}

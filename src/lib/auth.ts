'use client'

/**
 * Real Supabase auth wrapper.
 *
 * Two kinds of "roles" are in play:
 *   - App-level role: `case_manager` | `case_rep`. Drives UI routing.
 *   - DB-level role (public.users.role enum): `admin | case_manager |
 *     intake_agent | medical_manager`. That's what the existing schema
 *     has. We map between them:
 *       case_manager  ↔ case_manager (and `admin` also appears as
 *                                      case_manager in the app)
 *       case_rep      ↔ intake_agent
 *
 * The full user profile lives in `public.users` and is created by the
 * `handle_new_user` trigger when auth.users gets a new row. We pass role
 * + full_name as auth metadata at signUp time so the trigger picks them up.
 *
 * Middleware.ts needs to know the role without calling the DB on every
 * request, so we mirror it into a small `injuryflow_role` cookie. The
 * Supabase session cookie itself is written by @supabase/ssr.
 */

import { create } from 'zustand'
import type {
  AuthChangeEvent,
  Session as SupabaseSession,
} from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase/client'

export type Role = 'case_manager' | 'case_rep'

export interface Session {
  id: string
  email: string
  full_name: string
  role: Role
  created_at: string
}

// ──────────────────────────────────────────────────────────────────
// DB ↔ app role mapping
// ──────────────────────────────────────────────────────────────────

type DbRole = 'admin' | 'case_manager' | 'intake_agent' | 'medical_manager'

function appToDbRole(role: Role): DbRole {
  return role === 'case_manager' ? 'case_manager' : 'intake_agent'
}

function dbToAppRole(role: string | null | undefined): Role {
  // Admins + case_managers land on the manager UI.
  // Anything else (including medical_manager which has no UI yet) lands
  // on the rep side so they still have *something* to do.
  if (role === 'admin' || role === 'case_manager') return 'case_manager'
  return 'case_rep'
}

// ──────────────────────────────────────────────────────────────────
// Role cookie — read by middleware, written by the client
// ──────────────────────────────────────────────────────────────────

const ROLE_COOKIE = 'injuryflow_role'

function setRoleCookie(role: Role, days = 30) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${ROLE_COOKIE}=${role}; expires=${expires}; path=/; SameSite=Lax`
}

function clearRoleCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${ROLE_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

// ──────────────────────────────────────────────────────────────────
// Profile fetch helper
// ──────────────────────────────────────────────────────────────────

async function fetchProfile(userId: string): Promise<{
  full_name: string
  role: DbRole
  email: string
  created_at: string
} | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('users')
    .select('full_name, role, email, created_at')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data as {
    full_name: string
    role: DbRole
    email: string
    created_at: string
  }
}

function shapeSession(
  supaSession: SupabaseSession,
  profile: { full_name: string; role: DbRole; email: string; created_at: string } | null
): Session {
  const appRole = dbToAppRole(profile?.role)
  return {
    id: supaSession.user.id,
    email: profile?.email ?? supaSession.user.email ?? '',
    full_name:
      profile?.full_name ??
      (supaSession.user.user_metadata?.full_name as string | undefined) ??
      supaSession.user.email ??
      'User',
    role: appRole,
    created_at: profile?.created_at ?? new Date().toISOString(),
  }
}

// ──────────────────────────────────────────────────────────────────
// Zustand store
// ──────────────────────────────────────────────────────────────────

interface AuthStore {
  session: Session | null
  hydrated: boolean
  hydrate: () => Promise<void>
  _setSession: (session: Session | null) => void
}

let authListenerAttached = false

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  hydrated: false,
  hydrate: async () => {
    try {
      const supabase = getSupabase()

      // Attach the auth-state listener exactly once per tab.
      if (!authListenerAttached) {
        authListenerAttached = true
        supabase.auth.onAuthStateChange(
          async (_event: AuthChangeEvent, supaSession: SupabaseSession | null) => {
            if (!supaSession) {
              clearRoleCookie()
              set({ session: null })
              return
            }
            const profile = await fetchProfile(supaSession.user.id)
            const shaped = shapeSession(supaSession, profile)
            setRoleCookie(shaped.role)
            set({ session: shaped })
          }
        )
      }

      const { data } = await supabase.auth.getSession()
      if (data.session) {
        const profile = await fetchProfile(data.session.user.id)
        const shaped = shapeSession(data.session, profile)
        setRoleCookie(shaped.role)
        set({ session: shaped, hydrated: true })
        return
      }
      clearRoleCookie()
      set({ session: null, hydrated: true })
    } catch (err) {
      // Most likely: Supabase env isn't set. Surface to console and leave
      // the user logged out so the landing page still renders.
      console.error('[auth] hydrate failed:', err)
      set({ session: null, hydrated: true })
    }
  },
  _setSession: (session) => {
    if (session) setRoleCookie(session.role)
    else clearRoleCookie()
    set({ session })
  },
}))

// ──────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────

export interface AuthResult {
  ok: boolean
  error?: string
  session?: Session
  // Some flows (email confirmation enabled in Supabase) will succeed at
  // signup but require the user to click a link before logging in.
  needsEmailConfirmation?: boolean
}

export async function signUp(params: {
  email: string
  password: string
  full_name: string
  role: Role
}): Promise<AuthResult> {
  const { email, password, full_name, role } = params

  if (!email || !password || !full_name) {
    return { ok: false, error: 'All fields are required.' }
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' }
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: full_name.trim(),
          role: appToDbRole(role),
        },
      },
    })

    if (error) {
      return { ok: false, error: error.message }
    }

    // If the project requires email confirmation, `session` is null. Let
    // the UI show a "check your inbox" message.
    if (!data.session) {
      return {
        ok: true,
        needsEmailConfirmation: true,
      }
    }

    // Auto-confirmed — fetch profile and hydrate.
    const profile = await fetchProfile(data.session.user.id)
    const shaped = shapeSession(data.session, profile)
    useAuthStore.getState()._setSession(shaped)
    return { ok: true, session: shaped }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Signup failed' }
  }
}

export async function signIn(params: {
  email: string
  password: string
  role: Role
}): Promise<AuthResult> {
  const { email, password, role } = params
  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' }
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      return { ok: false, error: error.message }
    }
    if (!data.session) {
      return { ok: false, error: 'Sign-in did not return a session.' }
    }

    const profile = await fetchProfile(data.session.user.id)
    const shaped = shapeSession(data.session, profile)

    // Enforce the side they picked matches their real role.
    if (shaped.role !== role) {
      await supabase.auth.signOut()
      useAuthStore.getState()._setSession(null)
      const expected = shaped.role === 'case_manager' ? 'Case Manager' : 'Case Rep'
      return {
        ok: false,
        error: `This account is registered as a ${expected}. Use the other panel.`,
      }
    }

    useAuthStore.getState()._setSession(shaped)
    return { ok: true, session: shaped }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Sign-in failed' }
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = getSupabase()
    await supabase.auth.signOut()
  } finally {
    useAuthStore.getState()._setSession(null)
  }
}

// ──────────────────────────────────────────────────────────────────
// Demo accounts
//
// Two seeded accounts that the landing page exposes via "Try as demo"
// buttons. Trying to log in to a non-existent demo account creates it
// on the fly using `signUp`, then signs in. So whoever clicks the
// button first effectively seeds the account for everyone else.
//
// These are real Supabase auth users — once seeded, they behave
// identically to a self-signed-up account.
// ──────────────────────────────────────────────────────────────────

const DEMO_PASSWORD = 'FelicettiDemo2026!'

// NOTE on demo email domain: we use felicetti-team.app (a real,
// non-reserved TLD) because Supabase's email validator rejects the
// IETF-reserved TLDs `.test`, `.example`, `.invalid`, `.localhost`.
// The address doesn't need to actually receive mail — Supabase only
// validates format here, and the demo flow has email confirmation off.
export const DEMO_ACCOUNTS: Record<
  Role,
  { email: string; full_name: string }
> = {
  case_manager: {
    email: 'demo.manager@felicetti-team.app',
    full_name: 'Demo Manager',
  },
  case_rep: {
    email: 'demo.rep@felicetti-team.app',
    full_name: 'Demo Rep',
  },
}

export async function signInDemo(role: Role): Promise<AuthResult> {
  const demo = DEMO_ACCOUNTS[role]

  // Demo accounts are seeded one-time via supabase/seeds/demo-accounts.sql
  // (see that file's header for why direct DB seed instead of signUp).
  // Here we only sign in; we never attempt to create the account at
  // runtime, which avoids Supabase's signup rate limit.
  const result = await signIn({
    email: demo.email,
    password: DEMO_PASSWORD,
    role,
  })
  if (result.ok) return result

  // Translate Supabase's terse error into something actionable.
  const lower = (result.error ?? '').toLowerCase()
  if (
    lower.includes('invalid login') ||
    lower.includes('not found') ||
    lower.includes('credentials')
  ) {
    return {
      ok: false,
      error:
        'Demo accounts have not been seeded yet. Open Supabase → SQL Editor and run the contents of supabase/seeds/demo-accounts.sql once, then click again.',
    }
  }
  return result
}

export function homeForRole(role: Role): string {
  return role === 'case_manager' ? '/dashboard' : '/rep-intake'
}

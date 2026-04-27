'use client'

/**
 * Cases — the canonical record of a signed client. Created when the
 * manager submits the full 6-step intake form. Backed by the
 * `cases` Supabase table.
 *
 * The DB auto-generates the `case_number` (format: `IF-XXXXXX`) via the
 * `cases_case_number_seq` sequence configured in the RLS policies
 * migration. We never set it from client code — Postgres assigns one
 * on INSERT and returns it back.
 */

import { create } from 'zustand'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase/client'
import type { Case } from '@/types'

// Payload accepted by createCase. case_number is intentionally absent —
// the DB owns it.
export type NewCasePayload = Omit<
  Case,
  'id' | 'case_number' | 'created_at' | 'updated_at'
>

// ──────────────────────────────────────────────────────────────────
// Mutations
// ──────────────────────────────────────────────────────────────────

export async function createCase(
  payload: NewCasePayload
): Promise<{ ok: true; case: Case } | { ok: false; error: string }> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('cases')
      .insert(payload)
      .select('*')
      .single()
    if (error) throw error
    return { ok: true, case: data as Case }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Create failed' }
  }
}

export async function getCase(
  id: string
): Promise<{ ok: true; case: Case | null } | { ok: false; error: string }> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return { ok: true, case: (data as Case | null) ?? null }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Lookup failed' }
  }
}

// ──────────────────────────────────────────────────────────────────
// Store + realtime
// ──────────────────────────────────────────────────────────────────

interface CasesStore {
  cases: Case[]
  loading: boolean
  hydrated: boolean
  error: string | null
  hydrate: () => Promise<void>
  refresh: () => Promise<void>
  reset: () => void
}

let realtimeUnsub: (() => void) | null = null

type StoreSet = (
  partial:
    | Partial<CasesStore>
    | ((s: CasesStore) => Partial<CasesStore>),
) => void
type StoreGet = () => CasesStore

function ensureRealtime(set: StoreSet, get: StoreGet) {
  if (realtimeUnsub) return
  try {
    const supabase = getSupabase()
    const channel = supabase
      .channel('cases-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cases' },
        (payload: RealtimePostgresChangesPayload<Case>) => {
          const list = get().cases
          if (payload.eventType === 'INSERT' && payload.new) {
            const incoming = payload.new as Case
            if (!list.some((c) => c.id === incoming.id)) {
              set({ cases: [incoming, ...list] })
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updated = payload.new as Case
            set({
              cases: list.map((c) => (c.id === updated.id ? updated : c)),
            })
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const removed = payload.old as Partial<Case>
            set({ cases: list.filter((c) => c.id !== removed.id) })
          }
        },
      )
      .subscribe()
    realtimeUnsub = () => {
      supabase.removeChannel(channel)
      realtimeUnsub = null
    }
  } catch (err) {
    console.warn('[cases] realtime subscribe failed (non-blocking):', err)
  }
}

export const useCasesStore = create<CasesStore>((set, get) => ({
  cases: [],
  loading: false,
  hydrated: false,
  error: null,

  hydrate: async () => {
    const cur = get()
    if (cur.loading || cur.hydrated) {
      ensureRealtime(set, get)
      return
    }
    set({ loading: true, error: null })

    const timeout = setTimeout(() => {
      const s = get()
      if (s.loading) {
        console.warn('[cases] hydrate timed out after 6s; releasing UI')
        set({
          loading: false,
          hydrated: true,
          error: 'Timed out loading cases — try refresh.',
        })
      }
    }, 6000)

    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      set({
        cases: (data ?? []) as Case[],
        loading: false,
        hydrated: true,
      })
      ensureRealtime(set, get)
    } catch (err) {
      set({
        loading: false,
        hydrated: true,
        error: err instanceof Error ? err.message : 'Failed to load cases',
      })
    } finally {
      clearTimeout(timeout)
    }
  },

  refresh: async () => {
    set({ hydrated: false })
    await get().hydrate()
  },

  reset: () => {
    realtimeUnsub?.()
    set({ cases: [], loading: false, hydrated: false, error: null })
  },
}))

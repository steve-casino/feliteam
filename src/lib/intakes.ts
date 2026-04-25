'use client'

/**
 * Intakes — short-form leads submitted by Reps and worked through by
 * Case Managers. Backed by the `intakes` Supabase table (see
 * supabase/migrations/<ts>_intakes.sql). Uses Realtime so any change
 * shows up everywhere instantly.
 *
 * Status workflow:
 *   draft → not_signed → (chase | scheduled | under_review | signed
 *                         | did_not_sign | rejected)
 *
 * `chase` is *derived*, not stored. An intake stays `not_signed` in the
 * DB; we render it as `chase` if it's been sitting unsigned past the
 * threshold (CHASE_AFTER_DAYS). Managers can also set `chase` explicitly
 * if they want to.
 */

import { create } from 'zustand'
import type {
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase/client'

export const CHASE_AFTER_DAYS = 7

export type IntakeStatus =
  | 'draft'
  | 'not_signed'
  | 'chase'
  | 'scheduled'
  | 'under_review'
  | 'signed'
  | 'did_not_sign'
  | 'rejected'

export interface Intake {
  id: string
  full_name: string
  current_address: string | null
  phone: string | null
  emergency_phone: string | null
  email: string | null
  dob: string | null
  ssn_last4: string | null
  marital_status: string | null
  country_of_birth: string | null
  status: IntakeStatus
  scheduled_at: string | null
  scheduled_note: string | null
  submitted_by_rep_id: string | null
  reviewed_by_manager_id: string | null
  is_draft: boolean
  draft_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
  signed_at: string | null
}

// ──────────────────────────────────────────────────────────────────
// Status metadata for UI
// ──────────────────────────────────────────────────────────────────

export const STATUS_META: Record<
  IntakeStatus,
  { label: string; tone: string }
> = {
  draft:        { label: 'Draft',        tone: 'bg-white/5 text-white/50 border-white/10' },
  not_signed:   { label: 'Not Signed',   tone: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  chase:        { label: 'Chase',        tone: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  scheduled:    { label: 'Scheduled',    tone: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30' },
  under_review: { label: 'Under Review', tone: 'bg-purple-500/15 text-purple-300 border-purple-400/30' },
  signed:       { label: 'Signed',       tone: 'bg-teal-400/15 text-teal-300 border-teal-400/40' },
  did_not_sign: { label: 'Did Not Sign', tone: 'bg-red-500/10 text-red-300 border-red-500/30' },
  rejected:     { label: 'Rejected',     tone: 'bg-coral-400/15 text-coral-400 border-coral-400/30' },
}

/** Statuses a manager can move an intake into via the status menu. */
export const MANAGER_TARGET_STATUSES: IntakeStatus[] = [
  'not_signed',
  'scheduled',
  'under_review',
  'signed',
  'did_not_sign',
  'rejected',
]

/**
 * Apply the auto-Chase rule: a `not_signed` intake older than
 * CHASE_AFTER_DAYS is rendered as `chase`. Other statuses pass through.
 */
export function effectiveStatus(intake: Intake, now: Date = new Date()): IntakeStatus {
  if (intake.status !== 'not_signed') return intake.status
  const created = new Date(intake.created_at)
  const ageDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return ageDays >= CHASE_AFTER_DAYS ? 'chase' : 'not_signed'
}

// ──────────────────────────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────────────────────────

interface IntakeStore {
  intakes: Intake[]
  loading: boolean
  hydrated: boolean
  error: string | null
  hydrate: () => Promise<void>
  refresh: () => Promise<void>
  unsubscribe: () => void
}

let realtimeUnsub: (() => void) | null = null

export const useIntakeStore = create<IntakeStore>((set, get) => ({
  intakes: [],
  loading: false,
  hydrated: false,
  error: null,

  hydrate: async () => {
    // Already loading? Don't kick off another one, but don't BLOCK either.
    if (get().loading) return
    set({ loading: true, error: null })

    // Hard timeout so a stuck network call can't leave us pinned to
    // `loading: true` (which would also pin `hydrated: false`).
    const timeout = setTimeout(() => {
      const s = get()
      if (s.loading) {
        console.warn('[intakes] hydrate timed out after 8s; releasing UI')
        set({ loading: false, hydrated: true, error: 'Timed out loading intakes — try refresh.' })
      }
    }, 8000)

    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('intakes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      set({
        intakes: (data ?? []) as Intake[],
        loading: false,
        hydrated: true,
      })

      // Subscribe to realtime updates once.
      if (!realtimeUnsub) {
        const channel = supabase
          .channel('intakes-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'intakes' },
            (payload: RealtimePostgresChangesPayload<Intake>) => {
              const list = get().intakes
              if (payload.eventType === 'INSERT' && payload.new) {
                const incoming = payload.new as Intake
                if (!list.some((i) => i.id === incoming.id)) {
                  set({ intakes: [incoming, ...list] })
                }
              } else if (payload.eventType === 'UPDATE' && payload.new) {
                const updated = payload.new as Intake
                set({
                  intakes: list.map((i) =>
                    i.id === updated.id ? updated : i
                  ),
                })
              } else if (payload.eventType === 'DELETE' && payload.old) {
                const removed = payload.old as Partial<Intake>
                set({
                  intakes: list.filter((i) => i.id !== removed.id),
                })
              }
            }
          )
          .subscribe()
        realtimeUnsub = () => {
          supabase.removeChannel(channel)
          realtimeUnsub = null
        }
      }
    } catch (err) {
      set({
        loading: false,
        hydrated: true,
        error: err instanceof Error ? err.message : 'Failed to load intakes',
      })
    } finally {
      clearTimeout(timeout)
    }
  },

  refresh: async () => {
    set({ hydrated: false })
    await get().hydrate()
  },

  unsubscribe: () => {
    realtimeUnsub?.()
  },
}))

// ──────────────────────────────────────────────────────────────────
// Mutations
// ──────────────────────────────────────────────────────────────────

export interface IntakePayload {
  full_name: string
  current_address?: string
  phone?: string
  emergency_phone?: string
  email?: string
  dob?: string | null
  ssn_last4?: string
  marital_status?: string
  country_of_birth?: string
  scheduled_at?: string | null
  scheduled_note?: string | null
}

export async function submitIntake(
  payload: IntakePayload,
  repId: string
): Promise<{ ok: true; intake: Intake } | { ok: false; error: string }> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('intakes')
      .insert({
        ...payload,
        submitted_by_rep_id: repId,
        status: 'not_signed',
        is_draft: false,
        draft_data: null,
      })
      .select('*')
      .single()
    if (error) throw error
    return { ok: true, intake: data as Intake }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Submit failed' }
  }
}

export async function saveDraft(
  draftData: Record<string, unknown>,
  repId: string,
  existingDraftId?: string | null
): Promise<{ ok: true; intake: Intake } | { ok: false; error: string }> {
  try {
    const supabase = getSupabase()
    // Pull a name out of the draft so the list is recognizable.
    const fullName =
      typeof draftData.fullName === 'string' && draftData.fullName.trim().length > 0
        ? (draftData.fullName as string).trim()
        : 'Untitled draft'

    if (existingDraftId) {
      const { data, error } = await supabase
        .from('intakes')
        .update({
          full_name: fullName,
          draft_data: draftData,
          is_draft: true,
          status: 'draft',
        })
        .eq('id', existingDraftId)
        .select('*')
        .single()
      if (error) throw error
      return { ok: true, intake: data as Intake }
    }

    const { data, error } = await supabase
      .from('intakes')
      .insert({
        full_name: fullName,
        submitted_by_rep_id: repId,
        is_draft: true,
        status: 'draft',
        draft_data: draftData,
      })
      .select('*')
      .single()
    if (error) throw error
    return { ok: true, intake: data as Intake }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Save failed' }
  }
}

export async function discardDraft(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.from('intakes').delete().eq('id', id)
    if (error) throw error
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Delete failed' }
  }
}

export async function changeStatus(
  id: string,
  status: IntakeStatus,
  managerId: string,
  extras: { scheduled_at?: string | null; scheduled_note?: string | null } = {}
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = getSupabase()
    const update: Record<string, unknown> = {
      status,
      reviewed_by_manager_id: managerId,
    }
    if (status !== 'scheduled') {
      // Clear schedule if leaving the scheduled state.
      update.scheduled_at = null
      update.scheduled_note = null
    } else {
      if (extras.scheduled_at !== undefined) update.scheduled_at = extras.scheduled_at
      if (extras.scheduled_note !== undefined) update.scheduled_note = extras.scheduled_note
    }
    const { error } = await supabase.from('intakes').update(update).eq('id', id)
    if (error) throw error
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Update failed' }
  }
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

export function withinDateRange(
  intake: Intake,
  range: { from: Date | null; to: Date | null }
): boolean {
  const created = new Date(intake.created_at).getTime()
  if (range.from && created < range.from.getTime()) return false
  if (range.to && created > range.to.getTime()) return false
  return true
}

export function startOfMonthUTC(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

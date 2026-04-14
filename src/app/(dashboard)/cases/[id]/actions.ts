'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CaseStage, CaseNoteType } from '@/types'

export interface ActionResult {
  ok: boolean
  error?: string
}

export async function addNote(
  caseId: string,
  content: string,
  type: CaseNoteType = 'note'
): Promise<ActionResult> {
  if (!caseId || !content.trim()) {
    return { ok: false, error: 'Missing case or content' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { error } = await supabase.from('case_notes').insert({
    case_id: caseId,
    user_id: user.id,
    content: content.trim(),
    type,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/cases/${caseId}`)
  return { ok: true }
}

export async function changeStage(
  caseId: string,
  stage: CaseStage
): Promise<ActionResult> {
  if (!caseId || !stage) return { ok: false, error: 'Missing case or stage' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { data: prev } = await supabase
    .from('cases')
    .select('stage')
    .eq('id', caseId)
    .maybeSingle()

  const { error: updateErr } = await supabase
    .from('cases')
    .update({ stage })
    .eq('id', caseId)

  if (updateErr) return { ok: false, error: updateErr.message }

  await supabase.from('case_notes').insert({
    case_id: caseId,
    user_id: user.id,
    content: `Stage changed${prev ? ` from ${prev.stage}` : ''} to ${stage}`,
    type: 'stage_change' satisfies CaseNoteType,
  })

  revalidatePath(`/cases/${caseId}`)
  revalidatePath('/cases')
  return { ok: true }
}

export async function toggleUrgent(
  caseId: string,
  isUrgent: boolean
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('cases')
    .update({ is_urgent: isUrgent })
    .eq('id', caseId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  return { ok: true }
}

export async function toggleChecklistItem(
  itemId: string,
  completed: boolean,
  caseId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('checklist_items')
    .update({ completed })
    .eq('id', itemId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  return { ok: true }
}

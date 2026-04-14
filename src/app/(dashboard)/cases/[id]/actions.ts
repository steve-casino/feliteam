'use server'

import { revalidatePath } from 'next/cache'
import { getContext } from '@/lib/supabase/testing'
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

  const { userId, db } = await getContext()

  const { error } = await db.from('case_notes').insert([
    {
      case_id: caseId,
      user_id: userId,
      content: content.trim(),
      type,
    },
  ] as never)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/cases/${caseId}`)
  return { ok: true }
}

export async function changeStage(
  caseId: string,
  stage: CaseStage
): Promise<ActionResult> {
  if (!caseId || !stage) return { ok: false, error: 'Missing case or stage' }

  const { userId, db } = await getContext()

  const { data: prev } = await db
    .from('cases')
    .select('stage')
    .eq('id', caseId)
    .maybeSingle()

  const { error: updateErr } = await db
    .from('cases')
    .update({ stage } as never)
    .eq('id', caseId)

  if (updateErr) return { ok: false, error: updateErr.message }

  await db.from('case_notes').insert([
    {
      case_id: caseId,
      user_id: userId,
      content: `Stage changed${
        prev ? ` from ${(prev as { stage: string }).stage}` : ''
      } to ${stage}`,
      type: 'stage_change' as CaseNoteType,
    },
  ] as never)

  revalidatePath(`/cases/${caseId}`)
  revalidatePath('/cases')
  return { ok: true }
}

export async function toggleUrgent(
  caseId: string,
  isUrgent: boolean
): Promise<ActionResult> {
  const { db } = await getContext()
  const { error } = await db
    .from('cases')
    .update({ is_urgent: isUrgent } as never)
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
  const { db } = await getContext()
  const { error } = await db
    .from('checklist_items')
    .update({ completed } as never)
    .eq('id', itemId)
  if (error) return { ok: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  return { ok: true }
}

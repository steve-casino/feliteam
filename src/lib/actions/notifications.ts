'use server'

import { revalidatePath } from 'next/cache'
import { getContext } from '@/lib/supabase/testing'

export interface ActionResult {
  ok: boolean
  error?: string
}

export async function markAsRead(id: string): Promise<ActionResult> {
  const { userId, db } = await getContext()

  const { error } = await db
    .from('notifications')
    .update({ read: true } as never)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function markAllAsRead(): Promise<ActionResult> {
  const { userId, db } = await getContext()

  const { error } = await db
    .from('notifications')
    .update({ read: true } as never)
    .eq('user_id', userId)
    .eq('read', false)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function createNotification(input: {
  userId: string
  title: string
  message?: string
  type?: string
}): Promise<ActionResult> {
  const { db } = await getContext()
  const { error } = await db.from('notifications').insert([
    {
      user_id: input.userId,
      title: input.title,
      message: input.message ?? null,
      type: input.type ?? null,
    },
  ] as never)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/', 'layout')
  return { ok: true }
}

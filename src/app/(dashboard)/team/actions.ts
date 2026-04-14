'use server'

import { revalidatePath } from 'next/cache'
import { getContext } from '@/lib/supabase/testing'
import type { TeamPostType } from '@/types'

export interface ActionResult {
  ok: boolean
  error?: string
}

export async function createPost(
  content: string,
  type: TeamPostType
): Promise<ActionResult> {
  const trimmed = content.trim()
  if (!trimmed) return { ok: false, error: 'Content required' }

  const { userId, db } = await getContext()

  const { error } = await db.from('team_posts').insert([
    {
      user_id: userId,
      content: trimmed,
      type,
      reactions: {},
    },
  ] as never)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/team')
  return { ok: true }
}

export async function toggleReaction(
  postId: string,
  emoji: string
): Promise<ActionResult> {
  const { userId, db } = await getContext()

  const { data: post } = await db
    .from('team_posts')
    .select('reactions')
    .eq('id', postId)
    .maybeSingle()

  const existing =
    (post as { reactions: Record<string, string[]> | null } | null)
      ?.reactions ?? {}
  const reactions: Record<string, string[]> = { ...existing }
  const userList = reactions[emoji] ?? []
  reactions[emoji] = userList.includes(userId)
    ? userList.filter((id) => id !== userId)
    : [...userList, userId]

  const { error } = await db
    .from('team_posts')
    .update({ reactions } as never)
    .eq('id', postId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/team')
  return { ok: true }
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const { db } = await getContext()
  const { error } = await db.from('team_posts').delete().eq('id', postId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/team')
  return { ok: true }
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { TeamPostType } from '@/types'

export interface ActionResult {
  ok: boolean
  error?: string
}

export async function createPost(
  content: string,
  type: TeamPostType
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const trimmed = content.trim()
  if (!trimmed) return { ok: false, error: 'Content required' }

  const { error } = await supabase.from('team_posts').insert({
    user_id: user.id,
    content: trimmed,
    type,
    reactions: {},
  })
  if (error) return { ok: false, error: error.message }

  revalidatePath('/team')
  return { ok: true }
}

export async function toggleReaction(
  postId: string,
  emoji: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Not authenticated' }

  const { data: post } = await supabase
    .from('team_posts')
    .select('reactions')
    .eq('id', postId)
    .maybeSingle()

  const reactions: Record<string, string[]> = {
    ...(post?.reactions as Record<string, string[]> | null ?? {}),
  }
  const userList = reactions[emoji] ?? []
  reactions[emoji] = userList.includes(user.id)
    ? userList.filter((id) => id !== user.id)
    : [...userList, user.id]

  const { error } = await supabase
    .from('team_posts')
    .update({ reactions })
    .eq('id', postId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/team')
  return { ok: true }
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('team_posts').delete().eq('id', postId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/team')
  return { ok: true }
}

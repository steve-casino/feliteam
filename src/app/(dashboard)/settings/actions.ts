'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export interface ProfileInput {
  fullName: string
  avatarUrl: string
}

export interface ActionResult {
  ok: boolean
  error?: string
  message?: string
}

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Not authenticated' }

  const fullName = input.fullName.trim()
  if (!fullName) return { ok: false, error: 'Name is required' }

  const avatarUrl = input.avatarUrl.trim() || null

  const { error } = await supabase
    .from('users')
    .update({ full_name: fullName, avatar_url: avatarUrl })
    .eq('id', user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { ok: true, message: 'Profile updated' }
}

export async function changePassword(newPassword: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Not authenticated' }

  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters' }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { ok: false, error: error.message }

  return { ok: true, message: 'Password updated' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

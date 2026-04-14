'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getContext } from '@/lib/supabase/testing'

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
  const { userId, db } = await getContext()

  const fullName = input.fullName.trim()
  if (!fullName) return { ok: false, error: 'Name is required' }

  const avatarUrl = input.avatarUrl.trim() || null

  const { error } = await db
    .from('users')
    .update({ full_name: fullName, avatar_url: avatarUrl } as never)
    .eq('id', userId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { ok: true, message: 'Profile updated' }
}

export async function changePassword(newPassword: string): Promise<ActionResult> {
  const { userId, db, isAuthed } = await getContext()

  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters' }
  }

  if (!isAuthed) {
    return {
      ok: false,
      error: 'Password change requires an authenticated session (testing mode).',
    }
  }

  const { error } = await db.auth.admin.updateUserById(userId, {
    password: newPassword,
  })
  if (error) return { ok: false, error: error.message }

  return { ok: true, message: 'Password updated' }
}

export async function signOut() {
  // Testing mode: no-op. Kept for button wiring.
  redirect('/dashboard')
}

'use server'

import { revalidatePath } from 'next/cache'
import { getContext } from '@/lib/supabase/testing'
import type { UserRole } from '@/types'

export interface ActionResult {
  ok: boolean
  error?: string
  userId?: string
}

// Testing mode: no admin role gate. In production, wrap each action with
// `if (profile.role !== 'admin') return { ok: false, error: ... }`.

export async function createUserAccount(input: {
  email: string
  password: string
  fullName: string
  role: UserRole
}): Promise<ActionResult> {
  const { db } = await getContext()

  if (!input.email.trim() || !input.password || input.password.length < 8) {
    return { ok: false, error: 'Valid email and 8+ char password required' }
  }

  const { data, error } = await db.auth.admin.createUser({
    email: input.email.trim(),
    password: input.password,
    email_confirm: true,
  })

  if (error || !data.user) {
    return { ok: false, error: error?.message ?? 'Failed to create user' }
  }

  const { error: profileErr } = await db.from('users').upsert([
    {
      id: data.user.id,
      email: input.email.trim(),
      full_name: input.fullName.trim() || input.email.trim(),
      role: input.role,
    },
  ] as never)

  if (profileErr) return { ok: false, error: profileErr.message }

  revalidatePath('/admin')
  return { ok: true, userId: data.user.id }
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<ActionResult> {
  const { db } = await getContext()
  const { error } = await db
    .from('users')
    .update({ role } as never)
    .eq('id', userId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin')
  return { ok: true }
}

export async function deactivateUser(userId: string): Promise<ActionResult> {
  const { userId: callerId, db } = await getContext()
  if (callerId === userId) {
    return { ok: false, error: 'Cannot deactivate yourself' }
  }

  const { error } = await db.auth.admin.deleteUser(userId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin')
  return { ok: true }
}

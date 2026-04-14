'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types'

export interface ActionResult {
  ok: boolean
  error?: string
  userId?: string
}

async function assertAdmin(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.role !== 'admin') return null
  return user.id
}

export async function createUserAccount(input: {
  email: string
  password: string
  fullName: string
  role: UserRole
}): Promise<ActionResult> {
  const callerId = await assertAdmin()
  if (!callerId) return { ok: false, error: 'Admin privileges required' }

  if (!input.email.trim() || !input.password || input.password.length < 8) {
    return { ok: false, error: 'Valid email and 8+ char password required' }
  }

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email.trim(),
    password: input.password,
    email_confirm: true,
  })

  if (error || !data.user) {
    return { ok: false, error: error?.message ?? 'Failed to create user' }
  }

  const { error: profileErr } = await admin.from('users').upsert([
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
  const callerId = await assertAdmin()
  if (!callerId) return { ok: false, error: 'Admin privileges required' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .update({ role } as never)
    .eq('id', userId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin')
  return { ok: true }
}

export async function deactivateUser(userId: string): Promise<ActionResult> {
  const callerId = await assertAdmin()
  if (!callerId) return { ok: false, error: 'Admin privileges required' }
  if (callerId === userId) {
    return { ok: false, error: 'Cannot deactivate yourself' }
  }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin')
  return { ok: true }
}

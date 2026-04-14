import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'
import type { Case, User } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (me?.role !== 'admin') redirect('/dashboard')

  const [{ data: users }, { data: cases }] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('cases').select('*'),
  ])

  return (
    <AdminClient
      users={(users ?? []) as User[]}
      cases={(cases ?? []) as Case[]}
    />
  )
}

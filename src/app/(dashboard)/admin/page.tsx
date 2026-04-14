import { getContext } from '@/lib/supabase/testing'
import AdminClient from './AdminClient'
import type { Case, User } from '@/types'

export const dynamic = 'force-dynamic'

// Testing mode: no role gate. In production, add:
//   if (profile.role !== 'admin') redirect('/dashboard')
export default async function AdminPage() {
  const { db } = await getContext()

  const [{ data: users }, { data: cases }] = await Promise.all([
    db.from('users').select('*'),
    db.from('cases').select('*'),
  ])

  return (
    <AdminClient
      users={(users ?? []) as User[]}
      cases={(cases ?? []) as Case[]}
    />
  )
}

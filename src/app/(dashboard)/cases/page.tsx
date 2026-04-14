import { getContext } from '@/lib/supabase/testing'
import CasesList from './CasesList'
import type { Case, User } from '@/types'

export const dynamic = 'force-dynamic'

export default async function CasesPage() {
  const { db } = await getContext()

  const [{ data: cases }, { data: users }] = await Promise.all([
    db.from('cases').select('*').order('created_at', { ascending: false }),
    db.from('users').select('*'),
  ])

  return <CasesList cases={(cases ?? []) as Case[]} users={(users ?? []) as User[]} />
}

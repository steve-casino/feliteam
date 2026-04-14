import { createClient } from '@/lib/supabase/server'
import CasesList from './CasesList'
import type { Case, User } from '@/types'

export default async function CasesPage() {
  const supabase = await createClient()

  const [{ data: cases }, { data: users }] = await Promise.all([
    supabase.from('cases').select('*').order('created_at', { ascending: false }),
    supabase.from('users').select('*'),
  ])

  return <CasesList cases={(cases ?? []) as Case[]} users={(users ?? []) as User[]} />
}

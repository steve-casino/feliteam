import { getContext } from '@/lib/supabase/testing'
import CaseDetailView from './CaseDetailView'
import type { Case, CaseNote, User } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params
  const { db } = await getContext()

  const [{ data: caseObj }, { data: notes }, { data: users }] = await Promise.all([
    db.from('cases').select('*').eq('id', id).maybeSingle(),
    db
      .from('case_notes')
      .select('*')
      .eq('case_id', id)
      .order('created_at', { ascending: false }),
    db.from('users').select('*'),
  ])

  return (
    <CaseDetailView
      caseObj={(caseObj as Case | null) ?? null}
      caseNotes={(notes ?? []) as CaseNote[]}
      users={(users ?? []) as User[]}
    />
  )
}

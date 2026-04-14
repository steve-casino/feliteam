import { getContext } from '@/lib/supabase/testing'
import DashboardView from './DashboardView'
import type { Case, ChecklistItem } from '@/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { userId, profile, db } = await getContext()

  const [{ data: cases }, { data: checklist }] = await Promise.all([
    db.from('cases').select('*').eq('assigned_case_manager_id', userId),
    db.from('checklist_items').select('*').eq('case_manager_id', userId),
  ])

  return (
    <DashboardView
      currentUser={profile}
      cases={(cases ?? []) as Case[]}
      checklistItems={(checklist ?? []) as ChecklistItem[]}
    />
  )
}

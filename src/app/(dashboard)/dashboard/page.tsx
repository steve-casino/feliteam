import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardView from './DashboardView'
import type { Case, ChecklistItem, User } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: cases }, { data: checklist }] = await Promise.all([
    supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('cases')
      .select('*')
      .eq('assigned_case_manager_id', user.id),
    supabase
      .from('checklist_items')
      .select('*')
      .eq('case_manager_id', user.id),
  ])

  const currentUser: User = (profile as User | null) ?? {
    id: user.id,
    email: user.email ?? '',
    full_name: user.email ?? 'User',
    role: 'intake_agent',
    xp_points: 0,
    level: 1,
    created_at: new Date().toISOString(),
  }

  return (
    <DashboardView
      currentUser={currentUser}
      cases={(cases ?? []) as Case[]}
      checklistItems={(checklist ?? []) as ChecklistItem[]}
    />
  )
}

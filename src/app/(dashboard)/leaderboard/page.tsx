import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LeaderboardClient from './LeaderboardClient'
import type { LeaderboardEntry, User, UserBadge } from '@/types'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: users }, { data: userBadges }, { data: closedCases }] =
    await Promise.all([
      supabase
        .from('users')
        .select('*')
        .order('xp_points', { ascending: false }),
      supabase.from('user_badges').select('*'),
      supabase.from('cases').select('assigned_case_manager_id').eq('stage', 'srl'),
    ])

  const closedCountByUser = new Map<string, number>()
  for (const c of closedCases ?? []) {
    const id = c.assigned_case_manager_id
    if (id) closedCountByUser.set(id, (closedCountByUser.get(id) ?? 0) + 1)
  }

  const entries: LeaderboardEntry[] = ((users ?? []) as User[]).map((u) => ({
    user_id: u.id,
    user_name: u.full_name ?? u.email ?? 'User',
    avatar: u.avatar_url ?? '',
    xp: u.xp_points ?? 0,
    cases_closed: closedCountByUser.get(u.id) ?? 0,
    checklist_rate: 0,
    level: typeof u.level === 'number' ? u.level : 1,
  }))

  return (
    <LeaderboardClient
      entries={entries}
      userBadges={(userBadges ?? []) as UserBadge[]}
      currentUserId={user.id}
    />
  )
}

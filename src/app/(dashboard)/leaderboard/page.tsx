import { getContext } from '@/lib/supabase/testing'
import LeaderboardClient from './LeaderboardClient'
import type { LeaderboardEntry, User, UserBadge } from '@/types'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const { userId, db } = await getContext()

  const [{ data: users }, { data: userBadges }, { data: closedCases }] =
    await Promise.all([
      db.from('users').select('*').order('xp_points', { ascending: false }),
      db.from('user_badges').select('*'),
      db.from('cases').select('assigned_case_manager_id').eq('stage', 'srl'),
    ])

  const closedCountByUser = new Map<string, number>()
  const closedRows = (closedCases ?? []) as Array<{
    assigned_case_manager_id: string | null
  }>
  for (const c of closedRows) {
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
      currentUserId={userId}
    />
  )
}

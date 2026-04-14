import { getContext } from '@/lib/supabase/testing'
import TeamClient from './TeamClient'
import type { TeamPost, User } from '@/types'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const { userId, db } = await getContext()

  const [{ data: users }, { data: posts }] = await Promise.all([
    db.from('users').select('*'),
    db
      .from('team_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  return (
    <TeamClient
      users={(users ?? []) as User[]}
      posts={(posts ?? []) as TeamPost[]}
      currentUserId={userId}
    />
  )
}

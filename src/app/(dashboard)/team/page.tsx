import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TeamClient from './TeamClient'
import type { TeamPost, User } from '@/types'

export default async function TeamPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: users }, { data: posts }] = await Promise.all([
    supabase.from('users').select('*'),
    supabase
      .from('team_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  return (
    <TeamClient
      users={(users ?? []) as User[]}
      posts={(posts ?? []) as TeamPost[]}
      currentUserId={user.id}
    />
  )
}

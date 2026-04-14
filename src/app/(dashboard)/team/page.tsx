import { createClient } from '@/lib/supabase/server'
import TeamClient from './TeamClient'
import type { User } from '@/types'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: users } = await supabase.from('users').select('*')
  return <TeamClient users={(users ?? []) as User[]} />
}

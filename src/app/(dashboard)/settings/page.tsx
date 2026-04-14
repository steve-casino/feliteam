import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <SettingsForm
      email={user.email ?? ''}
      fullName={profile?.full_name ?? ''}
      avatarUrl={profile?.avatar_url ?? ''}
      role={profile?.role ?? 'intake_agent'}
    />
  )
}

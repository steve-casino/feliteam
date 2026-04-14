import { getContext } from '@/lib/supabase/testing'
import SettingsForm from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const { profile } = await getContext()

  return (
    <SettingsForm
      email={profile.email ?? ''}
      fullName={profile.full_name ?? ''}
      avatarUrl={profile.avatar_url ?? ''}
      role={profile.role ?? 'intake_agent'}
    />
  )
}

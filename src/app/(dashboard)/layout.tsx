import { getContext } from '@/lib/supabase/testing'
import DashboardShell from '@/components/layout/DashboardShell'
import type { Notification } from '@/types'

export const dynamic = 'force-dynamic'


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, profile, db } = await getContext()

  const currentUser = {
    full_name: profile.full_name ?? profile.email ?? 'User',
    role: profile.role ?? 'intake_agent',
    xp_points: profile.xp_points ?? 0,
    level: typeof profile.level === 'number' ? profile.level : 1,
    avatar_url: profile.avatar_url ?? undefined,
  }

  const { data: notifications } = await db
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <DashboardShell
      currentUser={currentUser}
      initialNotifications={(notifications ?? []) as Notification[]}
    >
      {children}
    </DashboardShell>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/layout/DashboardShell'
import type { Notification } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, email, full_name, role, avatar_url, xp_points, level')
    .eq('id', user.id)
    .maybeSingle()

  const currentUser = {
    full_name: profile?.full_name ?? user.email ?? 'User',
    role: profile?.role ?? 'intake_agent',
    xp_points: profile?.xp_points ?? 0,
    level: typeof profile?.level === 'number' ? profile.level : 1,
    avatar_url: profile?.avatar_url ?? undefined,
  }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
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

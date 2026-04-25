'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  UserPlus,
  Users,
  Trophy,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  Calendar as CalendarIcon
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { signOut } from '@/lib/auth'

interface SidebarProps {
  currentUser: {
    full_name: string
    role: string
    xp_points: number
    level: number
    avatar_url?: string
  }
  notificationCount?: number
}

type NavItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
  disabled?: boolean
  adminOnly?: boolean
}

// Sidebar order: Dashboard first (opportunities feed), then Intake, then
// the temporarily-disabled sections grouped at the bottom.
//
// `disabled: true` greys a section out and makes it unclickable. The route
// itself is also redirected via middleware.ts so typing the URL still
// lands on a working page. To re-enable a section, remove the flag here
// AND drop the matching path from DISABLED_ROUTES in middleware.ts.
const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: CalendarIcon
  },
  {
    label: 'Intake',
    href: '/intake',
    icon: UserPlus
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: Settings,
    adminOnly: true,
    disabled: true
  },
  {
    label: 'Cases',
    href: '/cases',
    icon: Briefcase,
    disabled: true
  },
  {
    label: 'Team',
    href: '/team',
    icon: Users,
    disabled: true
  },
  {
    label: 'Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
    disabled: true
  }
]

const Sidebar: React.FC<SidebarProps> = ({ currentUser, notificationCount = 0 }) => {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.replace('/')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(href)
  }

  const allNavItems = navItems.filter(
    (item) => !item.adminOnly || currentUser.role === 'admin'
  )

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-navy-50 border-r border-white/10 transition-all duration-300 flex flex-col z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="text-blue-400 text-xl">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold text-blue-400">Felicetti Team</span>
          </div>
        )}
        {collapsed && <div className="text-blue-400"><Zap className="w-6 h-6" /></div>}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        {allNavItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          // Disabled items: render as a non-interactive div so they're visible
          // but can't be clicked or focused. Tooltip indicates the section is
          // coming soon.
          if (item.disabled) {
            const disabledTitle = collapsed
              ? `${item.label} — coming soon`
              : 'Coming soon'
            return (
              <div
                key={item.href}
                aria-disabled="true"
                title={disabledTitle}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/30 opacity-60 cursor-not-allowed select-none"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                )}
                {!collapsed && (
                  <span className="text-[10px] uppercase tracking-wide text-white/40 border border-white/10 rounded px-1.5 py-0.5">
                    Soon
                  </span>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-blue-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-white/10 p-4 space-y-4">
        {/* Notification Bell */}
        <button
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all relative ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Notifications' : undefined}
        >
          <Bell className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium flex-1 text-left">Notifications</span>}
          {notificationCount > 0 && (
            <div className="absolute top-2 right-2 bg-coral-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {notificationCount}
            </div>
          )}
        </button>

        {/* User Profile */}
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Avatar
            name={currentUser.full_name}
            src={currentUser.avatar_url}
            size={collapsed ? 'sm' : 'md'}
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentUser.full_name}</p>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
                <span className="text-teal-400 font-semibold">Lv {currentUser.level}</span>
              </div>
              <div className="mt-1.5 bg-navy-200 rounded-full h-1.5 w-full">
                <div
                  className="bg-gradient-to-r from-blue-400 to-teal-400 h-full rounded-full"
                  style={{ width: `${Math.min((currentUser.xp_points % 1000) / 10, 100)}%` }}
                />
              </div>
              <p className="text-xs text-white/50 mt-1">{currentUser.xp_points.toLocaleString()} XP</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Log out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Log out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full border-t border-white/10 p-4 flex justify-center text-white/60 hover:text-white transition-colors"
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  )
}

export default Sidebar

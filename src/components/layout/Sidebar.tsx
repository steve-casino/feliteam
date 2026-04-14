'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Zap
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'

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

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Cases',
    href: '/cases',
    icon: Briefcase
  },
  {
    label: 'Intake',
    href: '/intake',
    icon: UserPlus
  },
  {
    label: 'Team',
    href: '/team',
    icon: Users
  },
  {
    label: 'Leaderboard',
    href: '/leaderboard',
    icon: Trophy
  }
]

const Sidebar: React.FC<SidebarProps> = ({ currentUser, notificationCount = 0 }) => {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(href)
  }

  const adminItems = [
    {
      label: 'Admin',
      href: '/admin',
      icon: Settings
    }
  ]

  const allNavItems = currentUser.role === 'admin' ? [...navItems, ...adminItems] : navItems

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
            <div className="text-purple-400 text-xl">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold text-purple-400">InjuryFlow</span>
          </div>
        )}
        {collapsed && <div className="text-purple-400"><Zap className="w-6 h-6" /></div>}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        {allNavItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-purple-400 text-white'
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
                  className="bg-gradient-to-r from-purple-400 to-teal-400 h-full rounded-full"
                  style={{ width: `${Math.min((currentUser.xp_points % 1000) / 10, 100)}%` }}
                />
              </div>
              <p className="text-xs text-white/50 mt-1">{currentUser.xp_points.toLocaleString()} XP</p>
            </div>
          )}
        </div>
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

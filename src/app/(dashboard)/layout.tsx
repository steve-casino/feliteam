'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import NotificationPanel from '@/components/layout/NotificationPanel'
import { mockNotifications } from '@/lib/mock-data'
import { useAuthStore } from '@/lib/auth'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter()
  const { session, hydrated, hydrate } = useAuthStore()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  // Route guard. Wait until hydration finishes before deciding to redirect,
  // otherwise we flash-redirect away from a logged-in user.
  useEffect(() => {
    if (!hydrated) return
    if (!session) {
      router.replace('/')
    } else if (session.role !== 'case_manager') {
      router.replace('/rep-intake')
    }
  }, [hydrated, session, router])

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const handleNotificationClick = useCallback(() => {
    setNotificationPanelOpen((prev) => !prev)
  }, [])

  const handleMarkAsRead = useCallback((notificationId: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
  }, [])

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) => ({ ...n, read: true }))
    )
  }, [])

  // Render the dashboard the moment we have a Manager session, even if
  // `hydrated` hasn't flipped yet (it does so a few hundred ms after
  // navigation in the worst case). Only show the loading shell when we
  // genuinely have no session to render with.
  const isManagerSession = session?.role === 'case_manager'
  if (!isManagerSession) {
    // No session yet, or wrong role: keep the loader brief; the route
    // guard above will redirect once hydrated.
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    )
  }

  // Shape the auth session into what Sidebar expects. XP/level don't mean
  // anything for real logins yet — feed placeholder values.
  const currentUser = {
    full_name: session.full_name,
    role: session.role,
    xp_points: 0,
    level: 1,
    avatar_url: undefined,
  }

  return (
    <div className="min-h-screen bg-navy">
      {/* Sidebar */}
      <Sidebar currentUser={currentUser} notificationCount={unreadCount} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 sm:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Top Bar */}
      <TopBar
        title="Dashboard"
        onMenuToggle={handleMenuToggle}
        notificationCount={unreadCount}
        onNotificationClick={handleNotificationClick}
      />

      {/* Notification Panel */}
      {notificationPanelOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setNotificationPanelOpen(false)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      )}

      {/* Main Content */}
      <div className="pt-16 sm:ml-64 min-h-screen">
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

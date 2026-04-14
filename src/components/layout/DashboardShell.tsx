'use client'

import React, { useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import NotificationPanel from '@/components/layout/NotificationPanel'
import type { Notification } from '@/types'
import { markAsRead, markAllAsRead } from '@/lib/actions/notifications'

interface CurrentUser {
  full_name: string
  role: string
  xp_points: number
  level: number
  avatar_url?: string
}

interface DashboardShellProps {
  currentUser: CurrentUser
  initialNotifications: Notification[]
  children: React.ReactNode
}

const DashboardShell: React.FC<DashboardShellProps> = ({
  currentUser,
  initialNotifications,
  children,
}) => {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMenuToggle = useCallback(() => setSidebarOpen((v) => !v), [])
  const handleNotificationClick = useCallback(
    () => setNotificationPanelOpen((v) => !v),
    []
  )
  const handleMarkAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      startTransition(async () => {
        await markAsRead(id)
        router.refresh()
      })
    },
    [router]
  )
  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    startTransition(async () => {
      await markAllAsRead()
      router.refresh()
    })
  }, [router])

  return (
    <div className="min-h-screen bg-navy">
      <Sidebar currentUser={currentUser} notificationCount={unreadCount} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 sm:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <TopBar
        title="Dashboard"
        onMenuToggle={handleMenuToggle}
        notificationCount={unreadCount}
        onNotificationClick={handleNotificationClick}
      />

      {notificationPanelOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setNotificationPanelOpen(false)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      )}

      <div className="pt-16 sm:ml-64 min-h-screen">
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

export default DashboardShell

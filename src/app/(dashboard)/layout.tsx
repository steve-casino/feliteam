'use client'

import React, { useState, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import NotificationPanel from '@/components/layout/NotificationPanel'
import { mockUsers, mockNotifications } from '@/lib/mock-data'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

  // Use the admin user as the current user for now
  const currentUser = mockUsers[0]

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen(!sidebarOpen)
  }, [sidebarOpen])

  const handleNotificationClick = useCallback(() => {
    setNotificationPanelOpen(!notificationPanelOpen)
  }, [notificationPanelOpen])

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

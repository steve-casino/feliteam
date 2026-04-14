'use client'

import React, { useMemo } from 'react'
import { X, CheckCheck } from 'lucide-react'
import { Notification } from '@/types'

interface NotificationPanelProps {
  notifications: Notification[]
  onClose: () => void
  onMarkAsRead?: (notificationId: string) => void
  onMarkAllAsRead?: () => void
}

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    treatment_gap: '⚠️',
    police_report_flag: '📋',
    badge_earned: '🏆',
    case_assigned: '📌',
    document_received: '📄',
    team_post: '💬',
    stage_change: '📊',
    deadline: '⏰'
  }
  return icons[type] || '📢'
}

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

const isToday = (dateString: string): boolean => {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const { today, earlier, unreadCount } = useMemo(() => {
    const t = notifications.filter((n) => isToday(n.created_at))
    const e = notifications.filter((n) => !isToday(n.created_at))
    const unread = notifications.filter((n) => !n.read).length

    return { today: t, earlier: e, unreadCount: unread }
  }, [notifications])

  return (
    <div className="absolute top-16 right-0 w-full sm:w-96 bg-navy-50 border border-white/10 rounded-lg shadow-2xl z-50 max-h-96 sm:max-h-[500px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-sm font-semibold text-white">Notifications</h2>
        <button
          onClick={onClose}
          className="p-1 text-white/60 hover:text-white hover:bg-white/5 rounded transition-all"
          aria-label="Close notifications"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mark All as Read */}
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllAsRead}
          className="px-4 py-2 text-xs font-medium text-teal-400 hover:text-teal-300 hover:bg-white/5 border-b border-white/10 flex items-center gap-2 transition-all"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </button>
      )}

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-white/50 text-sm">No notifications yet</p>
          </div>
        ) : (
          <>
            {/* Today Section */}
            {today.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-white/5 text-xs font-semibold text-white/70 uppercase tracking-wider sticky top-0 z-10">
                  Today
                </div>
                <div className="space-y-0.5 p-2">
                  {today.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => onMarkAsRead?.(notif.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        notif.read
                          ? 'bg-white/5 hover:bg-white/10'
                          : 'bg-purple-400/10 hover:bg-purple-400/20 border border-purple-400/20'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="text-xl flex-shrink-0">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{notif.title}</p>
                          <p className="text-xs text-white/70 line-clamp-2 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-white/50 mt-1.5">{getTimeAgo(notif.created_at)}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Earlier Section */}
            {earlier.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-white/5 text-xs font-semibold text-white/70 uppercase tracking-wider sticky top-0 z-10">
                  Earlier
                </div>
                <div className="space-y-0.5 p-2">
                  {earlier.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => onMarkAsRead?.(notif.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        notif.read
                          ? 'bg-white/5 hover:bg-white/10'
                          : 'bg-purple-400/10 hover:bg-purple-400/20 border border-purple-400/20'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="text-xl flex-shrink-0">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{notif.title}</p>
                          <p className="text-xs text-white/70 line-clamp-2 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-white/50 mt-1.5">{getTimeAgo(notif.created_at)}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-teal-400 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NotificationPanel

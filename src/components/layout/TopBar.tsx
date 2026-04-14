'use client'

import React, { useState } from 'react'
import { Menu, X, Bell, ChevronRight } from 'lucide-react'
import SearchInput from '@/components/ui/SearchInput'
import LanguageToggle from '@/components/ui/LanguageToggle'

interface TopBarProps {
  title: string
  onMenuToggle: () => void
  notificationCount?: number
  onNotificationClick?: () => void
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  onMenuToggle,
  notificationCount = 0,
  onNotificationClick
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-navy-50 border-b border-white/10 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left Section - Mobile Menu + Desktop Breadcrumb */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuToggle}
          className="sm:hidden p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-white/70">
          <span className="text-sm font-medium">Dashboard</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>

        {/* Mobile Title */}
        <div className="sm:hidden">
          <h1 className="text-sm font-semibold text-white">{title}</h1>
        </div>
      </div>

      {/* Right Section - Search, Language, Notifications */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Input - Desktop Only */}
        <div className="hidden md:block">
          <SearchInput
            placeholder="Search cases, clients..."
            value={searchQuery}
            onSearchChange={setSearchQuery}
            className="w-56"
          />
        </div>

        {/* Language Toggle - Desktop Only */}
        <div className="hidden sm:block">
          <LanguageToggle />
        </div>

        {/* Notification Bell */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 bg-coral-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

export default TopBar

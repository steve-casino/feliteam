'use client'

import React from 'react'

interface BadgeProps {
  name: string
  icon: string
  earned: boolean
  className?: string
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ name, icon, earned, className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
          earned
            ? 'bg-gradient-to-br from-purple-500/20 to-teal-500/20 ring-1 ring-purple-400/30 shadow-lg shadow-purple-500/20'
            : 'bg-white/5 opacity-50 grayscale'
        } ${className}`}
      >
        <div
          className={`text-4xl transition-transform duration-200 ${
            earned ? 'scale-100' : 'scale-75'
          }`}
        >
          {icon}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">{name}</p>
        </div>
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge

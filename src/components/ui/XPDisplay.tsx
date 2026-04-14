'use client'

import React, { useEffect, useState } from 'react'
import { LEVEL_THRESHOLDS } from '@/lib/constants'
import ProgressBar from './ProgressBar'

interface XPDisplayProps {
  xp: number
  level?: number
  className?: string
}

const XPDisplay = React.forwardRef<HTMLDivElement, XPDisplayProps>(
  ({ xp, level, className = '' }, ref) => {
    const [displayXp, setDisplayXp] = useState(0)

    useEffect(() => {
      const timer = setTimeout(() => {
        setDisplayXp(xp)
      }, 100)
      return () => clearTimeout(timer)
    }, [xp])

    const currentLevel = level ?? LEVEL_THRESHOLDS.length
    const currentLevelData =
      LEVEL_THRESHOLDS[Math.min(currentLevel - 1, LEVEL_THRESHOLDS.length - 1)]
    const nextLevelData =
      LEVEL_THRESHOLDS[Math.min(currentLevel, LEVEL_THRESHOLDS.length - 1)]

    const currentLevelXp = currentLevelData?.xp_required || 0
    const nextLevelXp = nextLevelData?.xp_required || currentLevelXp
    const xpInLevel = Math.max(0, displayXp - currentLevelXp)
    const xpToNextLevel = Math.max(0, nextLevelXp - currentLevelXp)
    const progressPercent =
      xpToNextLevel > 0 ? (xpInLevel / xpToNextLevel) * 100 : 0

    return (
      <div ref={ref} className={`space-y-2 ${className}`}>
        <div className="flex items-end gap-2">
          <div>
            <p className="text-2xl font-bold text-purple-400">
              {displayXp.toLocaleString()}
            </p>
            <p className="text-xs text-white/50">XP Points</p>
          </div>
          {currentLevelData && (
            <p className="text-sm text-white/70 mb-1">
              {currentLevelData.name}
            </p>
          )}
        </div>
        <ProgressBar value={progressPercent} color="purple" size="sm" />
        <p className="text-xs text-white/50">
          {xpInLevel.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
          to next level
        </p>
      </div>
    )
  }
)

XPDisplay.displayName = 'XPDisplay'

export default XPDisplay

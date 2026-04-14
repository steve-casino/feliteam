'use client'

import React, { useEffect, useState } from 'react'

interface ProgressBarProps {
  value: number
  color?: 'purple' | 'teal' | 'coral'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      color = 'purple',
      size = 'md',
      showLabel = false,
      className = ''
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
      setDisplayValue(value)
    }, [value])

    const colorClasses = {
      purple: 'bg-purple-400',
      teal: 'bg-teal-400',
      coral: 'bg-coral-400'
    }

    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    }

    const normalizedValue = Math.max(0, Math.min(100, displayValue))

    return (
      <div ref={ref} className={`w-full ${className}`}>
        <div
          className={`w-full bg-white/5 rounded-full overflow-hidden ${sizeClasses[size]}`}
        >
          <div
            className={`${colorClasses[color]} h-full transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${normalizedValue}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-2 text-sm text-white/70 text-center">
            {normalizedValue}%
          </div>
        )}
      </div>
    )
  }
)

ProgressBar.displayName = 'ProgressBar'

export default ProgressBar

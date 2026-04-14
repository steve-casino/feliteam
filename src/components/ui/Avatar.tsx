'use client'

import React, { useMemo } from 'react'

interface AvatarProps {
  name?: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  isOnline?: boolean
  className?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name = '', src, size = 'md', isOnline = false, className = '' }, ref) => {
    const initials = useMemo(() => {
      return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }, [name])

    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-14 h-14 text-lg'
    }

    const onlineIndicatorSize = {
      sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
      md: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
      lg: 'w-3 h-3 -bottom-1 -right-1'
    }

    return (
      <div
        ref={ref}
        className={`relative inline-flex items-center justify-center rounded-full font-semibold text-white ${sizeClasses[size]} ${
          src ? '' : 'bg-gradient-to-br from-purple-500 to-purple-600'
        } ${className}`}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
        {isOnline && (
          <div
            className={`absolute bg-teal-400 rounded-full border-2 border-navy ${onlineIndicatorSize[size]}`}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export default Avatar

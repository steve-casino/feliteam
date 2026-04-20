'use client'

import React, { ReactNode } from 'react'

interface CardProps {
  variant?: 'default' | 'highlighted' | 'urgent'
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = 'default', children, className = '', header, footer },
    ref
  ) => {
    const variantClasses = {
      default:
        'bg-navy-50 border border-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-blue-500/10',
      highlighted:
        'bg-navy-50 border-2 border-blue-400 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/20',
      urgent:
        'bg-navy-50 border-2 border-coral-400 hover:border-coral-300 hover:shadow-lg hover:shadow-coral-500/20'
    }

    return (
      <div
        ref={ref}
        className={`rounded-xl overflow-hidden transition-all duration-200 ${variantClasses[variant]} ${className}`}
      >
        {header && (
          <div className="border-b border-white/5 px-6 py-4">
            {header}
          </div>
        )}
        <div className="px-6 py-4">
          {children}
        </div>
        {footer && (
          <div className="border-t border-white/5 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card

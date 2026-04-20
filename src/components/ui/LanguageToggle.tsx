'use client'

import React, { useEffect, useState } from 'react'
import { useLanguageStore } from '@/hooks/useLanguage'

interface LanguageToggleProps {
  className?: string
}

const LanguageToggle = React.forwardRef<HTMLDivElement, LanguageToggleProps>(
  ({ className = '' }, ref) => {
    const language = useLanguageStore((state) => state.language)
    const toggleLanguage = useLanguageStore((state) => state.toggleLanguage)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted) {
      return null
    }

    return (
      <div
        ref={ref}
        className={`inline-flex items-center gap-1 bg-navy-50 border border-white/10 rounded-full p-1 ${className}`}
      >
        <button
          onClick={() => {
            if (language !== 'en') {
              toggleLanguage()
            }
          }}
          className={`px-4 py-1.5 rounded-full font-medium transition-all text-sm ${
            language === 'en'
              ? 'bg-blue-500 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => {
            if (language !== 'es') {
              toggleLanguage()
            }
          }}
          className={`px-4 py-1.5 rounded-full font-medium transition-all text-sm ${
            language === 'es'
              ? 'bg-blue-500 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          ES
        </button>
      </div>
    )
  }
)

LanguageToggle.displayName = 'LanguageToggle'

export default LanguageToggle

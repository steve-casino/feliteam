'use client'

import React, { InputHTMLAttributes, useCallback, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearchChange?: (value: string) => void
  debounceMs?: number
  className?: string
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      onSearchChange,
      debounceMs = 300,
      className = '',
      onChange,
      value = '',
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value)
    const debounceTimer = useRef<NodeJS.Timeout | null>(null)

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInternalValue(newValue)
        onChange?.(e)

        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current)
        }

        debounceTimer.current = setTimeout(() => {
          onSearchChange?.(newValue)
        }, debounceMs)
      },
      [onChange, onSearchChange, debounceMs]
    )

    const handleClear = useCallback(() => {
      setInternalValue('')
      onSearchChange?.('')
    }, [onSearchChange])

    return (
      <div
        className={`flex items-center gap-2 px-4 py-2.5 bg-navy-50 border border-white/10 rounded-lg hover:border-white/20 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400/30 transition-all ${className}`}
      >
        <Search className="w-5 h-5 text-white/50 flex-shrink-0" />
        <input
          ref={ref}
          type="text"
          value={internalValue}
          onChange={handleChange}
          className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
          {...props}
        />
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 text-white/50 hover:text-white hover:bg-white/5 rounded transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

export default SearchInput

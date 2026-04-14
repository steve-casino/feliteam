'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm font-semibold text-red-400">Something went wrong</p>
        <h1 className="text-2xl font-bold text-white">An unexpected error occurred</h1>
        {error.digest && (
          <p className="text-xs text-white/50 font-mono">ref: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-4 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

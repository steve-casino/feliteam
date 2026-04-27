'use client'

/**
 * Admin layout — public, no auth, no sidebar. The Admin section is
 * intentionally separate from the dashboard route group so it doesn't
 * inherit the role-gated dashboard chrome and doesn't redirect to login.
 */

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Zap } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-navy">
      {/* Top bar — minimal, no sidebar */}
      <header className="sticky top-0 z-30 bg-navy/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to landing</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-coral-400 to-coral-500 rounded shadow-md shadow-coral-400/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-extrabold text-white">
                Felicetti Team
              </p>
              <p className="text-[10px] uppercase tracking-wider text-coral-400 font-bold">
                Admin Console
              </p>
            </div>
          </div>
          <div className="w-32 hidden sm:block" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

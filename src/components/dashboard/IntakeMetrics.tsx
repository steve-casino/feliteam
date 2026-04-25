'use client'

/**
 * Intake metrics — top-of-dashboard tiles. Computed from the live
 * intakes store; updates with Realtime as intakes change.
 *
 *   • Total intakes this month — every non-draft intake created since
 *     the start of the current month.
 *   • Rejected — intakes the manager moved to 'rejected'.
 *   • Wanted intakes — Total − Rejected. Reflects how many of the
 *     leads reps brought in were actually worth pursuing.
 *   • Signups — intakes with status 'signed'.
 */

import React, { useEffect, useMemo } from 'react'
import { Inbox, Ban, Sparkles, ShieldCheck } from 'lucide-react'
import { useIntakeStore } from '@/lib/intakes'

function startOfThisMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export default function IntakeMetrics() {
  const { intakes, hydrate, hydrated } = useIntakeStore()

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  const stats = useMemo(() => {
    const monthStart = startOfThisMonth().getTime()
    const submitted = intakes.filter((i) => !i.is_draft)
    const thisMonth = submitted.filter(
      (i) => new Date(i.created_at).getTime() >= monthStart
    )
    const rejected = thisMonth.filter((i) => i.status === 'rejected')
    const signed = thisMonth.filter((i) => i.status === 'signed')
    const wanted = thisMonth.length - rejected.length
    return {
      total: thisMonth.length,
      rejected: rejected.length,
      wanted,
      signed: signed.length,
    }
  }, [intakes])

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Tile
        icon={Inbox}
        label="Total intakes (this month)"
        value={stats.total}
        accent="blue"
      />
      <Tile
        icon={Ban}
        label="Rejected"
        value={stats.rejected}
        accent="coral"
      />
      <Tile
        icon={Sparkles}
        label="Wanted intakes"
        value={stats.wanted}
        accent="indigo"
        helper="Total − Rejected"
      />
      <Tile
        icon={ShieldCheck}
        label="Signups"
        value={stats.signed}
        accent="teal"
      />
    </section>
  )
}

function Tile({
  icon: Icon,
  label,
  value,
  helper,
  accent,
}: {
  icon: typeof Inbox
  label: string
  value: number
  helper?: string
  accent: 'blue' | 'coral' | 'indigo' | 'teal'
}) {
  const accents = {
    blue: { ring: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/10' },
    coral: { ring: 'border-coral-400/30', text: 'text-coral-400', bg: 'bg-coral-400/10' },
    indigo: { ring: 'border-indigo-400/30', text: 'text-indigo-300', bg: 'bg-indigo-500/10' },
    teal: { ring: 'border-teal-400/40', text: 'text-teal-300', bg: 'bg-teal-400/10' },
  }[accent]

  return (
    <div
      className={`rounded-xl border ${accents.ring} bg-gradient-to-br from-navy-50 to-navy-100 p-4 shadow`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/50 font-bold">
            {label}
          </p>
          <p className={`text-3xl font-black mt-1 ${accents.text}`}>{value}</p>
          {helper && (
            <p className="text-[10px] text-white/40 mt-1">{helper}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${accents.bg}`}>
          <Icon className={`w-4 h-4 ${accents.text}`} />
        </div>
      </div>
    </div>
  )
}

'use client'

/**
 * Internal calendar — a chronological list of every intake currently in
 * 'scheduled' status, grouped by day. Each entry shows the client name,
 * time, and the quick-note that the manager attached when scheduling.
 *
 * v1 is intentionally a list (not a month-grid). Easy to scan, easy to
 * extend. We can swap the renderer for a true grid later without changing
 * the data layer.
 */

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { format, parseISO, startOfDay, isSameDay, isBefore, isAfter, addDays } from 'date-fns'
import {
  Calendar as CalendarIcon,
  Clock,
  StickyNote,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import {
  STATUS_META,
  useIntakeStore,
  type Intake,
} from '@/lib/intakes'

type Range = 'upcoming' | 'past' | 'all'

export default function CalendarPage() {
  const intakes = useIntakeStore((s) => s.intakes)
  const hydrate = useIntakeStore((s) => s.hydrate)
  const hydrated = useIntakeStore((s) => s.hydrated)
  const [range, setRange] = useState<Range>('upcoming')

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  const scheduled = useMemo(
    () =>
      intakes
        .filter((i) => i.status === 'scheduled' && i.scheduled_at)
        .sort((a, b) =>
          (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? '')
        ),
    [intakes]
  )

  const filtered = useMemo(() => {
    const now = new Date()
    return scheduled.filter((i) => {
      const t = parseISO(i.scheduled_at!)
      if (range === 'upcoming') return isAfter(t, addDays(now, -1))
      if (range === 'past') return isBefore(t, startOfDay(now))
      return true
    })
  }, [scheduled, range])

  // Group by day for the day-grouped list view.
  const byDay = useMemo(() => {
    const groups: { day: Date; items: Intake[] }[] = []
    for (const i of filtered) {
      const day = startOfDay(parseISO(i.scheduled_at!))
      const existing = groups.find((g) => isSameDay(g.day, day))
      if (existing) existing.items.push(i)
      else groups.push({ day, items: [i] })
    }
    return groups
  }, [filtered])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-indigo-300 mb-1">
            ◂ INTERNAL CALENDAR ▸
          </p>
          <h1 className="text-3xl font-black text-white">Scheduled intakes</h1>
          <p className="text-sm text-white/50 mt-1">
            Every intake currently in <span className="text-white">Scheduled</span>{' '}
            status, grouped by day. Quick-notes carry over from the dashboard.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-white/10 bg-navy-50 overflow-hidden">
          {(['upcoming', 'past', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                range === r
                  ? 'bg-indigo-500/30 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      {!hydrated ? (
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading…
        </div>
      ) : byDay.length === 0 ? (
        <Empty range={range} />
      ) : (
        <div className="space-y-6">
          {byDay.map(({ day, items }) => (
            <DaySection key={day.toISOString()} day={day} items={items} />
          ))}
        </div>
      )}

      <div className="text-xs text-white/40 pt-4 border-t border-white/5">
        Tip: change an intake&apos;s status to{' '}
        <span className={`px-1.5 py-0.5 rounded border ${STATUS_META.scheduled.tone}`}>
          Scheduled
        </span>{' '}
        on the{' '}
        <Link
          href="/dashboard"
          className="text-indigo-300 hover:text-white inline-flex items-center gap-0.5"
        >
          dashboard <ArrowRight className="w-3 h-3" />
        </Link>{' '}
        to add it here. Add a quick-note in the same menu and it shows up below
        the time.
      </div>
    </div>
  )
}

function DaySection({ day, items }: { day: Date; items: Intake[] }) {
  const isToday = isSameDay(day, new Date())
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="text-lg font-bold text-white">
          {format(day, 'EEEE')}
          <span className="text-white/40 font-normal ml-2">
            {format(day, 'MMM d, yyyy')}
          </span>
        </h2>
        {isToday && (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-teal-400/40 bg-teal-400/15 text-teal-300">
            Today
          </span>
        )}
      </div>
      <div className="space-y-2">
        {items.map((i) => (
          <CalendarRow key={i.id} intake={i} />
        ))}
      </div>
    </section>
  )
}

function CalendarRow({ intake }: { intake: Intake }) {
  const t = parseISO(intake.scheduled_at!)
  return (
    <div className="rounded-xl border border-white/10 bg-navy/40 hover:border-indigo-400/30 transition-colors p-4 flex items-start gap-4">
      <div className="flex flex-col items-center justify-center w-20 flex-shrink-0 rounded-lg border border-indigo-400/30 bg-indigo-500/10 p-3">
        <Clock className="w-3.5 h-3.5 text-indigo-300 mb-0.5" />
        <p className="text-sm font-bold text-white leading-none">{format(t, 'h:mm')}</p>
        <p className="text-[10px] text-indigo-300 font-bold mt-0.5">
          {format(t, 'a')}
        </p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{intake.full_name || 'Unnamed'}</p>
        <p className="text-[11px] text-white/50">
          {[intake.phone, intake.email].filter(Boolean).join(' · ') || 'No contact info'}
        </p>
        {intake.scheduled_note && (
          <div className="mt-2 flex items-start gap-2 text-xs text-white/80 bg-indigo-500/5 border border-indigo-400/20 rounded-md p-2.5">
            <StickyNote className="w-3.5 h-3.5 text-indigo-300 mt-0.5 flex-shrink-0" />
            <span>{intake.scheduled_note}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function Empty({ range }: { range: Range }) {
  const labels: Record<Range, string> = {
    upcoming: 'No upcoming scheduled intakes.',
    past: 'No past scheduled intakes.',
    all: 'Nothing on the calendar yet.',
  }
  return (
    <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
      <CalendarIcon className="w-8 h-8 text-white/20 mx-auto mb-3" />
      <p className="text-sm text-white/40 max-w-md mx-auto px-6">
        {labels[range]}
      </p>
    </div>
  )
}

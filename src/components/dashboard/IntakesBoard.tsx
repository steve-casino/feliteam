'use client'

/**
 * IntakesBoard — Case Manager view of all intakes.
 *   • Tabs by status (with auto-Chase derivation for aged not_signed)
 *   • Date-range filter (presets + custom)
 *   • Per-row status menu with Scheduled-only date+note inputs
 *   • Realtime updates via the intakes store
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, parseISO, format } from 'date-fns'
import {
  Inbox,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Filter,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth'
import {
  changeStatus,
  effectiveStatus,
  MANAGER_TARGET_STATUSES,
  STATUS_META,
  useIntakeStore,
  withinDateRange,
  type Intake,
  type IntakeStatus,
} from '@/lib/intakes'

type DatePreset = 'all' | 'today' | '7d' | '30d' | 'month' | 'custom'

const TAB_ORDER: IntakeStatus[] = [
  'not_signed',
  'chase',
  'scheduled',
  'under_review',
  'signed',
  'did_not_sign',
  'rejected',
]

function presetRange(preset: DatePreset): { from: Date | null; to: Date | null } {
  const now = new Date()
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  switch (preset) {
    case 'today':
      return { from: start(now), to: null }
    case '7d': {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      return { from: start(d), to: null }
    }
    case '30d': {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      return { from: start(d), to: null }
    }
    case 'month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: null }
    case 'all':
    case 'custom':
    default:
      return { from: null, to: null }
  }
}

export default function IntakesBoard() {
  const intakes = useIntakeStore((s) => s.intakes)
  const hydrate = useIntakeStore((s) => s.hydrate)
  const hydrated = useIntakeStore((s) => s.hydrated)
  const error = useIntakeStore((s) => s.error)
  const [activeStatus, setActiveStatus] = useState<IntakeStatus>('not_signed')
  const [preset, setPreset] = useState<DatePreset>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  const range = useMemo(() => {
    if (preset === 'custom') {
      return {
        from: customFrom ? new Date(customFrom) : null,
        to: customTo ? new Date(`${customTo}T23:59:59.999`) : null,
      }
    }
    return presetRange(preset)
  }, [preset, customFrom, customTo])

  // Pre-compute the (status, date-filtered) intake list per tab so
  // the count badges are accurate even on inactive tabs.
  const byStatus = useMemo(() => {
    const buckets: Record<IntakeStatus, Intake[]> = {
      draft: [],
      not_signed: [],
      chase: [],
      scheduled: [],
      under_review: [],
      signed: [],
      did_not_sign: [],
      rejected: [],
    }
    const now = new Date()
    for (const i of intakes) {
      if (i.is_draft) continue
      if (!withinDateRange(i, range)) continue
      const eff = effectiveStatus(i, now)
      buckets[eff].push(i)
    }
    return buckets
  }, [intakes, range])

  const visible = byStatus[activeStatus]

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30">
            <Inbox className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">
              Intakes
            </h2>
            <p className="text-xs text-white/50 leading-tight">
              Submitted by Case Reps · live feed
            </p>
          </div>
        </div>
        <DateRangeFilter
          preset={preset}
          customFrom={customFrom}
          customTo={customTo}
          onPresetChange={setPreset}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Couldn&apos;t load intakes: {error}
            <span className="block text-[11px] text-red-300/70 mt-1">
              If you just applied the migration, refresh the page.
            </span>
          </span>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1">
        {TAB_ORDER.map((status) => {
          const count = byStatus[status].length
          const meta = STATUS_META[status]
          const active = activeStatus === status
          return (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-md border-b-2 transition-colors flex items-center gap-2 ${
                active
                  ? 'border-blue-400 text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <span>{meta.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                  active ? meta.tone : 'bg-white/5 text-white/40 border-white/10'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* List */}
      {!hydrated ? (
        <Empty label="Loading intakes…" />
      ) : visible.length === 0 ? (
        <Empty
          label={`No intakes in ${STATUS_META[activeStatus].label} for this date range.`}
        />
      ) : (
        <div className="space-y-3">
          {visible.map((intake) => (
            <IntakeRow key={intake.id} intake={intake} />
          ))}
        </div>
      )}
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// Date range filter
// ──────────────────────────────────────────────────────────────────

const PRESET_LABELS: Record<DatePreset, string> = {
  all: 'All time',
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  month: 'This month',
  custom: 'Custom…',
}

function DateRangeFilter({
  preset,
  customFrom,
  customTo,
  onPresetChange,
  onCustomFromChange,
  onCustomToChange,
}: {
  preset: DatePreset
  customFrom: string
  customTo: string
  onPresetChange: (p: DatePreset) => void
  onCustomFromChange: (s: string) => void
  onCustomToChange: (s: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 text-white/50">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-[11px] uppercase tracking-wider font-bold">Date</span>
      </div>
      <select
        value={preset}
        onChange={(e) => onPresetChange(e.target.value as DatePreset)}
        className="px-2.5 py-1.5 bg-navy-100 border border-white/10 rounded-md text-xs text-white focus:outline-none focus:border-blue-400"
      >
        {(Object.keys(PRESET_LABELS) as DatePreset[]).map((k) => (
          <option key={k} value={k}>
            {PRESET_LABELS[k]}
          </option>
        ))}
      </select>
      {preset === 'custom' && (
        <>
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onCustomFromChange(e.target.value)}
            className="px-2 py-1.5 bg-navy-100 border border-white/10 rounded-md text-xs text-white focus:outline-none focus:border-blue-400"
          />
          <span className="text-white/40 text-xs">→</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onCustomToChange(e.target.value)}
            className="px-2 py-1.5 bg-navy-100 border border-white/10 rounded-md text-xs text-white focus:outline-none focus:border-blue-400"
          />
        </>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Row
// ──────────────────────────────────────────────────────────────────

function IntakeRow({ intake }: { intake: Intake }) {
  const router = useRouter()
  const meta = STATUS_META[effectiveStatus(intake)]
  const alreadySigned = Boolean(intake.case_id)

  const openInIntakeForm = () => {
    if (alreadySigned && intake.case_id) {
      router.push(`/cases/${intake.case_id}`)
      return
    }
    router.push(`/intake?from=${encodeURIComponent(intake.id)}`)
  }

  // Note: the entire row is clickable. The StatusMenu (and its dropdown)
  // calls stopPropagation so changing status doesn't also open the form.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openInIntakeForm}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openInIntakeForm()
        }
      }}
      className="group relative rounded-xl border border-white/10 bg-navy/50 p-4 hover:border-blue-400/40 hover:bg-navy/80 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/40"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white leading-tight flex items-center gap-2">
            {intake.full_name || 'Unnamed'}
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </h3>
          <p className="text-[11px] text-white/50 mt-0.5">
            Submitted{' '}
            {formatDistanceToNow(parseISO(intake.created_at), { addSuffix: true })}
            <span className="ml-2 text-blue-300/70">
              {alreadySigned
                ? '· Click to view the signed case'
                : '· Click to open in intake form'}
            </span>
          </p>
        </div>
        <StatusMenu intake={intake} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {intake.phone && (
          <DataCell icon={Phone} label="Phone" value={intake.phone} />
        )}
        {intake.email && (
          <DataCell icon={Mail} label="Email" value={intake.email} />
        )}
        {intake.dob && (
          <DataCell icon={CalendarIcon} label="DOB" value={intake.dob} />
        )}
        {intake.ssn_last4 && (
          <DataCell
            icon={ShieldCheck}
            label="SSN"
            value={`***-**-${intake.ssn_last4}`}
          />
        )}
        {intake.current_address && (
          <DataCell
            icon={MapPin}
            label="Address"
            value={intake.current_address}
            className="col-span-2"
          />
        )}
      </div>

      {intake.status === 'scheduled' && intake.scheduled_at && (
        <div className="mt-3 p-3 rounded-lg border border-indigo-400/30 bg-indigo-500/5">
          <p className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">
            Scheduled
          </p>
          <p className="text-sm text-white mt-0.5">
            {format(parseISO(intake.scheduled_at), "EEE, MMM d 'at' h:mm a")}
          </p>
          {intake.scheduled_note && (
            <p className="text-xs text-white/70 mt-1">
              <span className="text-white/40">Note:</span> {intake.scheduled_note}
            </p>
          )}
        </div>
      )}

      {/* Visible status pill (mirrors menu) */}
      <div className="mt-3 flex items-center justify-end">
        <span
          className={`text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded border ${meta.tone}`}
        >
          {meta.label}
        </span>
      </div>
    </div>
  )
}

function DataCell({
  icon: Icon,
  label,
  value,
  className = '',
}: {
  icon: typeof Phone
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold mb-0.5">
        {label}
      </p>
      <p className="text-xs text-white flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-white/40 flex-shrink-0" />
        <span className="truncate">{value}</span>
      </p>
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
      <p className="text-sm text-white/40 max-w-md mx-auto px-6">{label}</p>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Status change menu (with optional schedule fields)
// ──────────────────────────────────────────────────────────────────

function StatusMenu({ intake }: { intake: Intake }) {
  const session = useAuthStore((s) => s.session)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [scheduleAt, setScheduleAt] = useState(intake.scheduled_at?.slice(0, 16) ?? '')
  const [scheduleNote, setScheduleNote] = useState(intake.scheduled_note ?? '')

  const handle = async (status: IntakeStatus) => {
    if (!session) return
    setBusy(true)
    try {
      const extras =
        status === 'scheduled'
          ? {
              scheduled_at: scheduleAt
                ? new Date(scheduleAt).toISOString()
                : new Date().toISOString(),
              scheduled_note: scheduleNote || null,
            }
          : {}
      await changeStatus(intake.id, status, session.id, extras)
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  // The whole IntakeRow is a clickable button. We stop click propagation
  // here so changing status (or interacting with the schedule inputs)
  // doesn't ALSO open the full intake form.
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-colors"
      >
        Change status <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-navy-50 shadow-2xl z-30 p-3 space-y-2"
          onMouseLeave={() => setOpen(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">
            Move to
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {MANAGER_TARGET_STATUSES.map((s) => (
              <button
                key={s}
                disabled={busy || intake.status === s}
                onClick={() => handle(s)}
                className={`text-xs font-semibold px-2.5 py-2 rounded-md border transition-colors ${
                  intake.status === s
                    ? 'opacity-40 cursor-not-allowed border-white/10 text-white/40'
                    : `${STATUS_META[s].tone} hover:brightness-110`
                }`}
              >
                {STATUS_META[s].label}
              </button>
            ))}
          </div>

          {/* Scheduled extras */}
          <div className="border-t border-white/10 pt-2 space-y-2">
            <label className="block text-[10px] uppercase tracking-wider text-white/40 font-bold">
              Schedule (used when moving to Scheduled)
            </label>
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="w-full px-2 py-1.5 bg-navy-100 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-indigo-400"
            />
            <input
              type="text"
              value={scheduleNote}
              placeholder="Quick note (e.g. 'Bring DL + insurance card')"
              onChange={(e) => setScheduleNote(e.target.value)}
              className="w-full px-2 py-1.5 bg-navy-100 border border-white/10 rounded text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>
      )}
    </div>
  )
}

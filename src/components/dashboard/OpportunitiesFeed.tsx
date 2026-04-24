'use client'

/**
 * Live feed of opportunities submitted by Case Reps. Reads from the
 * Zustand `useOpportunityStore`. Drop-in inside the Case Manager dashboard.
 */

import React, { useEffect } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import {
  Inbox,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useOpportunityStore, type Opportunity } from '@/lib/opportunities'

const STATUS_META: Record<
  Opportunity['status'],
  { label: string; classes: string }
> = {
  new: {
    label: 'New',
    classes: 'bg-coral-400/15 text-coral-400 border-coral-400/30',
  },
  contacted: {
    label: 'Contacted',
    classes: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  converted: {
    label: 'Converted',
    classes: 'bg-teal-400/15 text-teal-400 border-teal-400/30',
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-white/5 text-white/50 border-white/10',
  },
}

const NEXT_STATUS: Record<Opportunity['status'], Opportunity['status']> = {
  new: 'contacted',
  contacted: 'converted',
  converted: 'converted',
  rejected: 'rejected',
}

const NEXT_ACTION_LABEL: Record<Opportunity['status'], string | null> = {
  new: 'Mark contacted',
  contacted: 'Mark converted',
  converted: null,
  rejected: null,
}

export default function OpportunitiesFeed() {
  const { opportunities, hydrated, hydrate, updateStatus } = useOpportunityStore()

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  const newCount = opportunities.filter((o) => o.status === 'new').length

  return (
    <section className="rounded-2xl border border-coral-400/25 bg-gradient-to-br from-navy-50 to-navy-100 p-5 md:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-coral-400/15 border border-coral-400/30">
            <Inbox className="w-5 h-5 text-coral-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">
              New Opportunities
            </h2>
            <p className="text-xs text-white/50 leading-tight">
              Submitted by Case Reps · needs attention
            </p>
          </div>
        </div>
        {newCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-coral-400/20 border border-coral-400/40 text-coral-300 text-xs font-bold">
            <Sparkles className="w-3 h-3" />
            {newCount} new
          </span>
        )}
      </div>

      {/* Empty state */}
      {!hydrated ? (
        <EmptyShell label="Loading..." />
      ) : opportunities.length === 0 ? (
        <EmptyShell label="No opportunities yet. Case Reps will appear here the moment they submit an intake." />
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              onAdvance={() => {
                const next = NEXT_STATUS[opp.status]
                if (next !== opp.status) updateStatus(opp.id, next)
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function OpportunityCard({
  opp,
  onAdvance,
}: {
  opp: Opportunity
  onAdvance: () => void
}) {
  const meta = STATUS_META[opp.status]
  const actionLabel = NEXT_ACTION_LABEL[opp.status]

  return (
    <div className="rounded-xl border border-white/10 bg-navy/50 p-4 hover:border-coral-400/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-base font-bold text-white leading-tight">
            {opp.full_name}
          </h3>
          <p className="text-[11px] text-white/50 mt-0.5">
            Submitted by{' '}
            <span className="text-white/70 font-semibold">
              {opp.submitted_by_rep_name}
            </span>{' '}
            ·{' '}
            {formatDistanceToNow(parseISO(opp.created_at), { addSuffix: true })}
          </p>
        </div>
        <span
          className={`text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded border ${meta.classes}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {opp.phone && (
          <DataCell icon={Phone} label="Phone" value={opp.phone} />
        )}
        {opp.email && (
          <DataCell icon={Mail} label="Email" value={opp.email} />
        )}
        {opp.dob && (
          <DataCell icon={Calendar} label="DOB" value={opp.dob} />
        )}
        {opp.ssn_last4 && (
          <DataCell
            icon={ShieldCheck}
            label="SSN"
            value={`***-**-${opp.ssn_last4}`}
          />
        )}
        {opp.current_address && (
          <DataCell
            icon={MapPin}
            label="Address"
            value={opp.current_address}
            className="col-span-2"
          />
        )}
      </div>

      {actionLabel && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onAdvance}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-coral-400/40 text-coral-300 hover:bg-coral-400/10 transition-colors"
          >
            {actionLabel}
          </button>
        </div>
      )}
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

function EmptyShell({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
      <p className="text-sm text-white/40 max-w-md mx-auto px-6">{label}</p>
    </div>
  )
}

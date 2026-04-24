'use client'

/**
 * Opportunities store — represents a short-form intake submitted by a Case
 * Rep. Lives client-side (localStorage + Zustand) for the demo. When the
 * Supabase `cases` / `opportunities` table is wired, replace the persistence
 * calls with `supabase.from('opportunities').insert/select`.
 */

import { create } from 'zustand'

const LS_KEY = 'injuryflow_opportunities_v1'

export interface Opportunity {
  id: string
  full_name: string
  current_address: string
  phone: string
  emergency_phone: string
  email: string
  dob: string
  ssn_last4: string
  marital_status: string
  country_of_birth: string
  submitted_by_rep_id: string
  submitted_by_rep_name: string
  status: 'new' | 'contacted' | 'converted' | 'rejected'
  created_at: string
}

function readStore(): Opportunity[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Opportunity[]) : []
  } catch {
    return []
  }
}

function writeStore(opps: Opportunity[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(opps))
}

interface OpportunityStore {
  opportunities: Opportunity[]
  hydrated: boolean
  hydrate: () => void
  addOpportunity: (
    opp: Omit<Opportunity, 'id' | 'created_at' | 'status'>
  ) => Opportunity
  updateStatus: (id: string, status: Opportunity['status']) => void
}

export const useOpportunityStore = create<OpportunityStore>((set, get) => ({
  opportunities: [],
  hydrated: false,
  hydrate: () => {
    set({ opportunities: readStore(), hydrated: true })
  },
  addOpportunity: (partial) => {
    const opp: Opportunity = {
      ...partial,
      id: 'opp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      status: 'new',
      created_at: new Date().toISOString(),
    }
    const next = [opp, ...get().opportunities]
    writeStore(next)
    set({ opportunities: next })
    return opp
  },
  updateStatus: (id, status) => {
    const next = get().opportunities.map((o) =>
      o.id === id ? { ...o, status } : o
    )
    writeStore(next)
    set({ opportunities: next })
  },
}))

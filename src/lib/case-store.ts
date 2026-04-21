'use client'

import { create } from 'zustand'
import { Case } from '@/types'
import { mockCases as initialCases } from './mock-data'

interface CaseStore {
  cases: Case[]
  addCase: (newCase: Case) => void
  updateCase: (id: string, updates: Partial<Case>) => void
}

export const useCaseStore = create<CaseStore>((set) => ({
  cases: [...initialCases],
  addCase: (newCase) =>
    set((state) => ({
      cases: [newCase, ...state.cases],
    })),
  updateCase: (id, updates) =>
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
}))

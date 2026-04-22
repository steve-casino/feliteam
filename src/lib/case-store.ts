import { Case } from '@/types'
import { mockCases as initialCases } from './mock-data'

// Mutable case list — works across client components without zustand re-render issues
let _cases: Case[] = [...initialCases]

// Listeners for React components that need to re-render when cases change
type Listener = () => void
const _listeners = new Set<Listener>()

export function getCases(): Case[] {
  return _cases
}

export function addCase(newCase: Case): void {
  _cases = [newCase, ..._cases]
  _listeners.forEach((fn) => fn())
}

export function updateCase(id: string, updates: Partial<Case>): void {
  _cases = _cases.map((c) => (c.id === id ? { ...c, ...updates } : c))
  _listeners.forEach((fn) => fn())
}

export function subscribe(listener: Listener): () => void {
  _listeners.add(listener)
  return () => _listeners.delete(listener)
}

// React hook that subscribes to case changes
import { useSyncExternalStore } from 'react'

export function useCases(): Case[] {
  return useSyncExternalStore(
    subscribe,
    () => _cases,
    () => _cases
  )
}

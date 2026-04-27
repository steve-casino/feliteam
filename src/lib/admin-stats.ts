'use client'

/**
 * Deterministic stats engine for the Admin chatbox.
 *
 * The chatbox sends the user's question + the current intakes/cases
 * datasets to `answerQuestion()`, which classifies the question by
 * keyword/intent and returns a structured answer (markdown text + a
 * small data table when relevant).
 *
 * No LLM is called; everything is computed locally from the data
 * already in the client stores. Predictable, instant, free.
 *
 * To swap in a real LLM later, replace the body of `answerQuestion()`
 * with a fetch to /api/admin-chat (server action that calls Anthropic
 * or OpenAI with the stats blob as context). The TypeScript surface
 * stays the same.
 */

import { effectiveStatus, type Intake } from './intakes'
import type { Case } from '@/types'

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

export interface RepStats {
  rep_id: string
  rep_name: string
  total: number
  signed: number
  not_signed: number
  chase: number
  scheduled: number
  rejected: number
  did_not_sign: number
  conversion_rate: number // signed / total
}

export interface ManagerStats {
  manager_id: string
  manager_name: string
  cases_owned: number
  cases_active: number
  cases_signed_this_month: number
}

export interface AdminAnswer {
  text: string
  table?: { headers: string[]; rows: (string | number)[][] }
  emoji?: string
}

// ──────────────────────────────────────────────────────────────────
// Aggregations
// ──────────────────────────────────────────────────────────────────

interface UserDirectoryEntry {
  id: string
  full_name: string
  role: string
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function startOfWeek(d = new Date()) {
  const day = d.getDay() // Sun=0, Sat=6
  const start = new Date(d)
  start.setDate(d.getDate() - day)
  start.setHours(0, 0, 0, 0)
  return start
}

function startOfDay(d = new Date()) {
  const s = new Date(d)
  s.setHours(0, 0, 0, 0)
  return s
}

export function computeRepStats(
  intakes: Intake[],
  users: UserDirectoryEntry[]
): RepStats[] {
  // Group submitted (non-draft) intakes by rep id.
  const grouped = new Map<string, Intake[]>()
  for (const i of intakes) {
    if (i.is_draft) continue
    const key = i.submitted_by_rep_id ?? 'unknown'
    const list = grouped.get(key) ?? []
    list.push(i)
    grouped.set(key, list)
  }

  const results: RepStats[] = []
  for (const [rep_id, list] of grouped) {
    const user = users.find((u) => u.id === rep_id)
    const rep_name = user?.full_name ?? 'Unknown rep'
    let signed = 0,
      not_signed = 0,
      chase = 0,
      scheduled = 0,
      rejected = 0,
      did_not_sign = 0
    for (const i of list) {
      const eff = effectiveStatus(i)
      if (eff === 'signed') signed++
      else if (eff === 'not_signed') not_signed++
      else if (eff === 'chase') chase++
      else if (eff === 'scheduled') scheduled++
      else if (eff === 'rejected') rejected++
      else if (eff === 'did_not_sign') did_not_sign++
    }
    const total = list.length
    results.push({
      rep_id,
      rep_name,
      total,
      signed,
      not_signed,
      chase,
      scheduled,
      rejected,
      did_not_sign,
      conversion_rate: total > 0 ? signed / total : 0,
    })
  }
  // Sort by signups desc, then total desc.
  results.sort((a, b) => b.signed - a.signed || b.total - a.total)
  return results
}

export function computeManagerStats(
  cases: Case[],
  users: UserDirectoryEntry[]
): ManagerStats[] {
  const grouped = new Map<string, Case[]>()
  for (const c of cases) {
    const key = c.assigned_case_manager_id ?? 'unassigned'
    const list = grouped.get(key) ?? []
    list.push(c)
    grouped.set(key, list)
  }
  const monthStart = startOfMonth().getTime()
  const results: ManagerStats[] = []
  for (const [manager_id, list] of grouped) {
    const user = users.find((u) => u.id === manager_id)
    const manager_name = user?.full_name ?? 'Unassigned'
    const active = list.filter((c) => c.stage !== 'srl').length
    const signedThisMonth = list.filter((c) => {
      const created = new Date(c.created_at).getTime()
      return created >= monthStart
    }).length
    results.push({
      manager_id,
      manager_name,
      cases_owned: list.length,
      cases_active: active,
      cases_signed_this_month: signedThisMonth,
    })
  }
  results.sort((a, b) => b.cases_owned - a.cases_owned)
  return results
}

// ──────────────────────────────────────────────────────────────────
// Intent matching
// ──────────────────────────────────────────────────────────────────

type Range = 'today' | 'week' | 'month' | 'all'

function detectRange(q: string): Range {
  if (/\btoday\b/.test(q)) return 'today'
  if (/\b(this )?week\b/.test(q)) return 'week'
  if (/\b(this )?month\b/.test(q)) return 'month'
  return 'all'
}

function rangeStart(range: Range): Date | null {
  if (range === 'today') return startOfDay()
  if (range === 'week') return startOfWeek()
  if (range === 'month') return startOfMonth()
  return null
}

function filterByRange<T extends { created_at: string }>(
  list: T[],
  range: Range
): T[] {
  const start = rangeStart(range)
  if (!start) return list
  const ms = start.getTime()
  return list.filter((item) => new Date(item.created_at).getTime() >= ms)
}

function rangeLabel(range: Range): string {
  return range === 'all' ? 'all time' : `this ${range === 'today' ? 'day' : range}`
}

// ──────────────────────────────────────────────────────────────────
// Public API: answerQuestion
// ──────────────────────────────────────────────────────────────────

export interface AnswerInput {
  question: string
  intakes: Intake[]
  cases: Case[]
  users: UserDirectoryEntry[]
}

export function answerQuestion(input: AnswerInput): AdminAnswer {
  const q = input.question.toLowerCase().trim()
  if (!q) return { text: 'Ask me anything about reps, intakes, or cases.' }

  const range = detectRange(q)

  // Help / capabilities
  if (/\b(help|what can you|what do you know|examples?)\b/.test(q)) {
    return {
      text:
        'I can answer questions about your team\'s performance using live data from Supabase. Try asking:\n\n' +
        '• "How many intakes this week?"\n' +
        '• "Who is the top rep?"\n' +
        '• "Show me rep performance"\n' +
        '• "How many signups this month?"\n' +
        '• "What\'s our conversion rate?"\n' +
        '• "Show me cases by manager"\n' +
        '• "How many cases are in chase?"\n' +
        '• "Which rep has the most rejections?"',
      emoji: '💡',
    }
  }

  const repStats = computeRepStats(input.intakes, input.users)
  const managerStats = computeManagerStats(input.cases, input.users)
  const submittedIntakes = input.intakes.filter((i) => !i.is_draft)
  const submittedScoped = filterByRange(submittedIntakes, range)
  const casesScoped = filterByRange(input.cases, range)

  // ── Top rep ──
  if (/\b(top|best|leading)\b.*\b(rep|reps|performer|salesperson)\b/.test(q)) {
    const top = repStats[0]
    if (!top || top.total === 0) {
      return { text: 'No rep activity yet — once intakes start coming in, the top performer will show up here.' }
    }
    return {
      text:
        `**${top.rep_name}** is leading with **${top.signed} signups** out of ${top.total} intakes ` +
        `(${Math.round(top.conversion_rate * 100)}% conversion).`,
      emoji: '🏆',
    }
  }

  // ── Worst / most rejections ──
  if (/\b(most|highest)\b.*\brejection/.test(q) || /\b(worst|underperform)/.test(q)) {
    const sorted = [...repStats].sort((a, b) => b.rejected - a.rejected)
    const top = sorted[0]
    if (!top || top.rejected === 0) {
      return { text: 'No rejections recorded yet.', emoji: '🎉' }
    }
    return {
      text: `**${top.rep_name}** has the most rejections: **${top.rejected}** of ${top.total} (${Math.round((top.rejected / top.total) * 100)}%).`,
      emoji: '⚠️',
    }
  }

  // ── Per-rep table ──
  if (/\b(rep|reps|performance|leaderboard|standings|breakdown)\b/.test(q) && !/manager/.test(q)) {
    if (repStats.length === 0) {
      return { text: 'No rep data yet — submit a baby intake to start.' }
    }
    return {
      text: `Performance breakdown for ${repStats.length} rep${repStats.length === 1 ? '' : 's'}:`,
      table: {
        headers: ['Rep', 'Total', 'Signed', 'Chase', 'Rejected', 'Conv.'],
        rows: repStats.map((r) => [
          r.rep_name,
          r.total,
          r.signed,
          r.chase,
          r.rejected,
          `${Math.round(r.conversion_rate * 100)}%`,
        ]),
      },
      emoji: '📊',
    }
  }

  // ── Per-manager ──
  if (/\bmanager/.test(q)) {
    if (managerStats.length === 0) {
      return { text: 'No manager case assignments yet.' }
    }
    return {
      text: `Cases by manager (${managerStats.length}):`,
      table: {
        headers: ['Manager', 'Total cases', 'Active', 'New this month'],
        rows: managerStats.map((m) => [
          m.manager_name,
          m.cases_owned,
          m.cases_active,
          m.cases_signed_this_month,
        ]),
      },
      emoji: '👥',
    }
  }

  // ── Conversion rate ──
  if (/\b(conversion|close rate|conv rate|sign rate)\b/.test(q)) {
    const total = submittedScoped.length
    const signed = submittedScoped.filter((i) => i.status === 'signed').length
    const rate = total > 0 ? Math.round((signed / total) * 100) : 0
    return {
      text:
        total === 0
          ? `No intakes ${rangeLabel(range)}.`
          : `Conversion rate ${rangeLabel(range)}: **${rate}%** (${signed} signed of ${total} intakes).`,
      emoji: '📈',
    }
  }

  // ── Counts ──
  if (/\b(intake|intakes|leads?)\b/.test(q)) {
    const total = submittedScoped.length
    return {
      text:
        total === 0
          ? `No intakes ${rangeLabel(range)} yet.`
          : `**${total}** intake${total === 1 ? '' : 's'} ${rangeLabel(range)}.`,
      emoji: '📥',
    }
  }
  if (/\b(signup|signed|sign-?ups?)\b/.test(q)) {
    const signed = submittedScoped.filter((i) => i.status === 'signed').length
    return {
      text:
        signed === 0
          ? `No signups ${rangeLabel(range)} yet.`
          : `**${signed}** signup${signed === 1 ? '' : 's'} ${rangeLabel(range)}.`,
      emoji: '✅',
    }
  }
  if (/\b(rejection|rejected)\b/.test(q)) {
    const rejected = submittedScoped.filter((i) => i.status === 'rejected').length
    return {
      text:
        rejected === 0
          ? `No rejections ${rangeLabel(range)}.`
          : `**${rejected}** rejection${rejected === 1 ? '' : 's'} ${rangeLabel(range)}.`,
      emoji: '🚫',
    }
  }
  if (/\b(chase|follow.?up)\b/.test(q)) {
    const chase = submittedScoped.filter((i) => effectiveStatus(i) === 'chase').length
    return {
      text:
        chase === 0
          ? 'Nothing in Chase right now — every Not Signed intake is still within the 7-day window.'
          : `**${chase}** intake${chase === 1 ? ' is' : 's are'} in Chase (Not Signed > 7 days).`,
      emoji: '⏰',
    }
  }
  if (/\bscheduled\b/.test(q)) {
    const scheduled = submittedScoped.filter((i) => i.status === 'scheduled').length
    return {
      text:
        scheduled === 0
          ? 'Nothing scheduled right now.'
          : `**${scheduled}** intake${scheduled === 1 ? '' : 's'} scheduled.`,
      emoji: '📅',
    }
  }
  if (/\bcase|cases\b/.test(q)) {
    const total = casesScoped.length
    return {
      text:
        total === 0
          ? `No cases ${rangeLabel(range)} yet.`
          : `**${total}** case${total === 1 ? '' : 's'} ${rangeLabel(range)}.`,
      emoji: '⚖️',
    }
  }

  // ── Specific person: "show me <name>" ──
  const personMatch = q.match(/(?:show me|how is|how's|stats for|about)\s+([a-z][a-z\s]+)/i)
  if (personMatch) {
    const name = personMatch[1].trim().toLowerCase()
    const rep = repStats.find((r) => r.rep_name.toLowerCase().includes(name))
    if (rep) {
      return {
        text:
          `**${rep.rep_name}** — ${rep.total} intakes, ${rep.signed} signed (${Math.round(rep.conversion_rate * 100)}%), ` +
          `${rep.chase} in chase, ${rep.rejected} rejected.`,
        emoji: '👤',
      }
    }
    const mgr = managerStats.find((m) => m.manager_name.toLowerCase().includes(name))
    if (mgr) {
      return {
        text:
          `**${mgr.manager_name}** — ${mgr.cases_owned} cases owned, ${mgr.cases_active} active, ` +
          `${mgr.cases_signed_this_month} new this month.`,
        emoji: '👤',
      }
    }
    return { text: `I couldn't find anyone matching "${personMatch[1].trim()}".` }
  }

  // Fallback
  return {
    text:
      'I\'m not sure how to answer that yet. Try asking about intakes, signups, conversion, rep performance, ' +
      'or specific people. Type **help** to see examples.',
    emoji: '🤔',
  }
}

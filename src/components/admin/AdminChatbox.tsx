'use client'

/**
 * Admin chatbox.
 * Polished chat UI on top of the deterministic stats engine in
 * src/lib/admin-stats.ts. No LLM required.
 *
 * Pulls live data from useIntakeStore + useCasesStore, plus the
 * existing mockUsers (until users are also wired to Supabase).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bot,
  Send,
  Sparkles,
  User as UserIcon,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useIntakeStore } from '@/lib/intakes'
import { useCasesStore } from '@/lib/cases'
import { mockUsers } from '@/lib/mock-data'
import {
  answerQuestion,
  type AdminAnswer,
} from '@/lib/admin-stats'

const SUGGESTED_PROMPTS = [
  'Who is the top rep?',
  'How many signups this month?',
  "What's our conversion rate?",
  'Show me rep performance',
  'How many intakes today?',
  'How many cases this month?',
]

type Message =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; answer: AdminAnswer }

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export default function AdminChatbox() {
  const intakes = useIntakeStore((s) => s.intakes)
  const intakesHydrated = useIntakeStore((s) => s.hydrated)
  const hydrateIntakes = useIntakeStore((s) => s.hydrate)
  const cases = useCasesStore((s) => s.cases)
  const casesHydrated = useCasesStore((s) => s.hydrated)
  const hydrateCases = useCasesStore((s) => s.hydrate)

  useEffect(() => {
    if (!intakesHydrated) hydrateIntakes()
    if (!casesHydrated) hydrateCases()
  }, [intakesHydrated, hydrateIntakes, casesHydrated, hydrateCases])

  const users = useMemo(
    () =>
      mockUsers.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        role: u.role,
      })),
    []
  )

  const dataReady = intakesHydrated && casesHydrated

  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      answer: {
        text:
          "Hi — I'm the team analyst. Ask me anything about reps, intakes, signups, or cases. " +
          "Type **help** for examples.",
        emoji: '👋',
      },
    },
  ])

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, thinking])

  const ask = async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || thinking) return
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'user', text: trimmed },
    ])
    setInput('')
    setThinking(true)

    // Tiny artificial latency so it feels like a chat, not a calculator.
    await new Promise((r) => setTimeout(r, 350 + Math.random() * 350))

    const answer = answerQuestion({
      question: trimmed,
      intakes,
      cases,
      users,
    })

    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'assistant', answer },
    ])
    setThinking(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    ask(input)
  }

  const reset = () => {
    setMessages([
      {
        id: 'welcome-2',
        role: 'assistant',
        answer: {
          text: 'Cleared. Ask me anything else.',
          emoji: '🧹',
        },
      },
    ])
    setInput('')
  }

  return (
    <section className="rounded-2xl border border-coral-400/30 bg-gradient-to-br from-navy-50 to-navy-100 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/10 bg-navy/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-coral-400 rounded-lg blur opacity-50 animate-pulse" />
            <div className="relative p-2 rounded-lg bg-gradient-to-br from-coral-400 to-coral-500">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white leading-tight">
              Team Analyst
            </h2>
            <p className="text-[11px] text-white/50">
              Ask about reps, intakes, signups, or cases
            </p>
          </div>
        </div>
        <button
          onClick={reset}
          className="text-[11px] text-white/50 hover:text-white flex items-center gap-1.5 transition-colors"
          title="Clear conversation"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Status: data ready */}
      {!dataReady && (
        <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-xs flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading live stats…
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="px-4 md:px-5 py-4 space-y-4 max-h-[420px] overflow-y-auto"
      >
        {messages.map((m) =>
          m.role === 'user' ? (
            <UserBubble key={m.id} text={m.text} />
          ) : (
            <BotBubble key={m.id} answer={m.answer} />
          )
        )}
        {thinking && <ThinkingBubble />}
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="px-4 md:px-5 pb-3 flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => ask(p)}
              disabled={!dataReady}
              className="text-[11px] px-3 py-1.5 rounded-full border border-white/10 bg-navy/50 text-white/70 hover:text-white hover:border-coral-400/40 hover:bg-coral-400/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 bg-navy/40 px-3 py-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            dataReady
              ? 'Ask anything about reps, intakes, signups…'
              : 'Loading…'
          }
          disabled={!dataReady}
          className="flex-1 px-3 py-2.5 bg-navy border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-coral-400 focus:outline-none transition-colors text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || thinking || !dataReady}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-coral-400 to-coral-500 hover:from-coral-500 hover:to-coral-400 text-white shadow-lg shadow-coral-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Send"
        >
          {thinking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// Bubbles
// ──────────────────────────────────────────────────────────────────

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="flex items-start gap-2 max-w-[80%]">
        <div className="bg-blue-500/15 border border-blue-500/30 rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm text-white">
          {text}
        </div>
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <UserIcon className="w-3.5 h-3.5 text-blue-300" />
        </div>
      </div>
    </div>
  )
}

function BotBubble({ answer }: { answer: AdminAnswer }) {
  return (
    <div className="flex">
      <div className="flex items-start gap-2 max-w-[90%]">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-coral-400/15 border border-coral-400/30 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-coral-400" />
        </div>
        <div className="bg-navy/70 border border-white/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm text-white leading-snug space-y-2">
          {answer.emoji && <span className="mr-1">{answer.emoji}</span>}
          <FormattedText text={answer.text} />
          {answer.table && <BotTable {...answer.table} />}
        </div>
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-coral-400/15 border border-coral-400/30 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-coral-400" />
        </div>
        <div className="bg-navy/70 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
          <Dot delay={0} />
          <Dot delay={150} />
          <Dot delay={300} />
        </div>
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-coral-400 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  )
}

// Tiny markdown subset: **bold** + line breaks. No HTML injection.
function FormattedText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <span className="whitespace-pre-line">
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {renderInlineBold(line)}
          {i < lines.length - 1 && '\n'}
        </React.Fragment>
      ))}
    </span>
  )
}

function renderInlineBold(line: string): React.ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-bold">
          {p.slice(2, -2)}
        </strong>
      )
    }
    return <React.Fragment key={i}>{p}</React.Fragment>
  })
}

function BotTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: (string | number)[][]
}) {
  return (
    <div className="mt-2 overflow-x-auto rounded-md border border-white/10">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="bg-white/5">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left font-bold text-white/70 uppercase tracking-wider px-2.5 py-1.5"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={ri % 2 ? 'bg-white/[0.02]' : ''}
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-2.5 py-1.5 text-white/90 whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Zap,
  Shield,
  Radio,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import {
  homeForRole,
  signIn,
  signUp,
  useAuthStore,
  type Role,
} from '@/lib/auth'

// ──────────────────────────────────────────────────────────────────
// Landing page — character select (Case Manager vs Case Rep)
// ──────────────────────────────────────────────────────────────────

type Panel = 'case_manager' | 'case_rep'
type AuthMode = 'login' | 'signup'

const CLASS_META: Record<
  Panel,
  {
    codename: string
    title: string
    tagline: string
    description: string
    stats: { label: string; value: string }[]
    accent: 'blue' | 'coral'
    Icon: typeof Shield
  }
> = {
  case_manager: {
    codename: 'OPERATOR',
    title: 'Case Manager',
    tagline: 'Run the playbook. Close the case.',
    description:
      'Full access to the case board, medical tracker, liability pipeline, and team ops. Opportunities land on your dashboard the moment a Rep submits one.',
    stats: [
      { label: 'Access', value: 'Full dashboard' },
      { label: 'Tools', value: 'Cases · Pipeline · Team' },
      { label: 'View', value: 'Live opportunities feed' },
    ],
    accent: 'blue',
    Icon: Shield,
  },
  case_rep: {
    codename: 'SCOUT',
    title: 'Case Rep',
    tagline: 'Intake fast. Hand it off clean.',
    description:
      'A focused 9-field intake form. Every submission becomes an opportunity on the Case Manager dashboard. No clutter, no backend nav — just capture and send.',
    stats: [
      { label: 'Access', value: 'Rep intake form' },
      { label: 'Fields', value: '9 (3 required)' },
      { label: 'Output', value: 'Opportunity record' },
    ],
    accent: 'coral',
    Icon: Radio,
  },
}

export default function LandingPage() {
  const router = useRouter()
  const { session, hydrated, hydrate } = useAuthStore()
  const [selected, setSelected] = useState<Panel | null>(null)

  // Hydrate auth store once on mount; if already logged in, bounce.
  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (hydrated && session) {
      router.replace(homeForRole(session.role))
    }
  }, [hydrated, session, router])

  // While we check for an existing session, show nothing — prevents a
  // flash of the landing page for already-logged-in users.
  if (!hydrated || session) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy relative overflow-hidden">
      {/* Ambient background */}
      <AmbientBackground />

      {/* Top brand */}
      <header className="relative z-10 flex items-center justify-center py-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            InjuryFlow
          </span>
        </div>
      </header>

      {/* Title */}
      <div className="relative z-10 text-center mt-4 mb-8 px-4">
        <p className="text-xs font-bold tracking-[0.3em] text-blue-400/80 mb-2">
          ◂ SELECT YOUR ROLE ▸
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          Who are you today?
        </h1>
        <p className="text-white/50 mt-3 text-sm md:text-base max-w-xl mx-auto">
          InjuryFlow splits your workflow by role. Pick the side that matches
          how you show up.
        </p>
      </div>

      {/* Panels */}
      <main className="relative z-10 px-4 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <RolePanel
            panel="case_manager"
            selected={selected === 'case_manager'}
            dimmed={selected !== null && selected !== 'case_manager'}
            onSelect={() => setSelected('case_manager')}
            onBack={() => setSelected(null)}
          />
          <RolePanel
            panel="case_rep"
            selected={selected === 'case_rep'}
            dimmed={selected !== null && selected !== 'case_rep'}
            onSelect={() => setSelected('case_rep')}
            onBack={() => setSelected(null)}
          />
        </div>
      </main>

      <footer className="relative z-10 pb-8 text-center text-xs text-white/40">
        Felicetti Law Firm · InjuryFlow ops platform
      </footer>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Ambient background — animated gradient orbs + grid
// ──────────────────────────────────────────────────────────────────

function AmbientBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Gradient orbs */}
      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute -bottom-40 -right-40 w-[420px] h-[420px] bg-coral-400/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1.5s' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] bg-blue-900/20 rounded-full blur-3xl" />
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Role panel — the big "character" card
// ──────────────────────────────────────────────────────────────────

function RolePanel({
  panel,
  selected,
  dimmed,
  onSelect,
  onBack,
}: {
  panel: Panel
  selected: boolean
  dimmed: boolean
  onSelect: () => void
  onBack: () => void
}) {
  const meta = CLASS_META[panel]
  const { Icon } = meta

  const accentClasses = useMemo(() => {
    if (meta.accent === 'blue') {
      return {
        border: 'border-blue-500/40',
        borderSelected: 'border-blue-400',
        glow: 'shadow-[0_0_80px_rgba(59,130,246,0.35)]',
        chip: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
        accentText: 'text-blue-400',
        button:
          'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/30',
        iconBg: 'from-blue-400 to-blue-600',
      }
    }
    return {
      border: 'border-coral-400/40',
      borderSelected: 'border-coral-400',
      glow: 'shadow-[0_0_80px_rgba(216,90,48,0.35)]',
      chip: 'bg-coral-400/15 text-coral-400 border-coral-400/30',
      accentText: 'text-coral-400',
      button:
        'bg-gradient-to-r from-coral-400 to-coral-500 hover:from-coral-500 hover:to-coral-400 shadow-coral-400/30',
      iconBg: 'from-coral-400 to-coral-500',
    }
  }, [meta.accent])

  return (
    <div
      className={`group relative rounded-2xl border-2 transition-all duration-300 overflow-hidden
        ${selected ? `${accentClasses.borderSelected} ${accentClasses.glow}` : accentClasses.border}
        ${dimmed ? 'opacity-40 scale-[0.98]' : 'opacity-100'}
        bg-gradient-to-br from-navy-50 to-navy-100`}
    >
      {/* Corner tag */}
      <div className="absolute top-3 right-3 z-10">
        <span
          className={`text-[10px] font-black tracking-[0.2em] px-2 py-1 rounded border ${accentClasses.chip}`}
        >
          {meta.codename}
        </span>
      </div>

      {/* Content switches between preview and auth form */}
      {!selected ? (
        <PanelPreview
          meta={meta}
          accentClasses={accentClasses}
          Icon={Icon}
          onSelect={onSelect}
        />
      ) : (
        <PanelAuth panel={panel} accentClasses={accentClasses} onBack={onBack} />
      )}
    </div>
  )
}

function PanelPreview({
  meta,
  accentClasses,
  Icon,
  onSelect,
}: {
  meta: (typeof CLASS_META)[Panel]
  accentClasses: {
    border: string
    borderSelected: string
    glow: string
    chip: string
    accentText: string
    button: string
    iconBg: string
  }
  Icon: typeof Shield
  onSelect: () => void
}) {
  return (
    <div className="p-8 flex flex-col h-full min-h-[520px]">
      {/* Icon */}
      <div className="flex justify-center my-6">
        <div
          className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${accentClasses.iconBg} flex items-center justify-center shadow-2xl`}
        >
          <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>
      </div>

      {/* Title + tagline */}
      <div className="text-center mb-4">
        <h2 className="text-3xl font-black text-white tracking-tight">
          {meta.title}
        </h2>
        <p className={`mt-2 text-sm font-semibold ${accentClasses.accentText}`}>
          {meta.tagline}
        </p>
      </div>

      {/* Description */}
      <p className="text-sm text-white/60 leading-relaxed text-center mb-6 px-2">
        {meta.description}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        {meta.stats.map((s) => (
          <div
            key={s.label}
            className="bg-navy/50 border border-white/5 rounded-lg p-2.5 text-center"
          >
            <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold">
              {s.label}
            </p>
            <p className="text-xs text-white mt-1 font-semibold leading-tight">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onSelect}
        className={`mt-auto w-full py-3.5 rounded-lg text-white font-bold tracking-wide shadow-xl transition-all flex items-center justify-center gap-2 ${accentClasses.button}`}
      >
        Select <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Auth form — appears when a panel is selected
// ──────────────────────────────────────────────────────────────────

function PanelAuth({
  panel,
  accentClasses,
  onBack,
}: {
  panel: Panel
  accentClasses: {
    accentText: string
    button: string
  }
  onBack: () => void
}) {
  const router = useRouter()
  const role: Role = panel
  const [mode, setMode] = useState<AuthMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmNotice, setConfirmNotice] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setConfirmNotice(null)
    setLoading(true)
    try {
      const result =
        mode === 'signup'
          ? await signUp({ email, password, full_name: fullName, role })
          : await signIn({ email, password, role })
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong. Try again.')
        setLoading(false)
        return
      }
      // Signup succeeded but Supabase is configured to require email
      // confirmation before issuing a session. Prompt the user.
      if (result.needsEmailConfirmation) {
        setConfirmNotice(
          `Check ${email} for a confirmation link. Once you click it, come back and sign in.`
        )
        setMode('login')
        setPassword('')
        setFullName('')
        setLoading(false)
        return
      }
      if (!result.session) {
        setError('Signed in but no session was returned. Try again.')
        setLoading(false)
        return
      }
      router.replace(homeForRole(result.session.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 flex flex-col min-h-[520px]">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to role select
      </button>

      <h3 className="text-2xl font-black text-white">
        {mode === 'signup' ? 'Create account' : 'Sign in'}
      </h3>
      <p className={`text-xs font-semibold mt-1 ${accentClasses.accentText}`}>
        {panel === 'case_manager' ? 'Case Manager access' : 'Case Rep access'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 flex-1 flex flex-col">
        {mode === 'signup' && (
          <LabelledInput
            label="Full name"
            icon={UserIcon}
            value={fullName}
            onChange={setFullName}
            placeholder="Jordan Reyes"
            autoFocus
            required
          />
        )}

        <LabelledInput
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@firm.com"
          required
          autoFocus={mode === 'login'}
        />

        <LabelledInput
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
          required
        />

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {confirmNotice && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-teal-500/10 border border-teal-400/30 text-teal-200 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{confirmNotice}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`mt-2 w-full py-3 rounded-lg text-white font-bold shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${accentClasses.button}`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {mode === 'signup' ? 'Create account' : 'Sign in'}{' '}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="mt-auto pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup')
              setError(null)
            }}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            {mode === 'signup'
              ? 'Already have an account? Sign in'
              : "New here? Create an account"}
          </button>
        </div>
      </form>
    </div>
  )
}

function LabelledInput({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  autoFocus,
}: {
  label: string
  icon: typeof Mail
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  autoFocus?: boolean
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold tracking-wide text-white/60 uppercase mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-3 py-2.5 bg-navy/60 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-blue-400 focus:outline-none transition-colors text-sm"
        />
      </div>
    </div>
  )
}

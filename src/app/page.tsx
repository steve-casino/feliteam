'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  PlayCircle,
  Settings,
} from 'lucide-react'
import {
  homeForRole,
  signIn,
  signInDemo,
  signUp,
  useAuthStore,
  type Role,
} from '@/lib/auth'

// ──────────────────────────────────────────────────────────────────
// Internal landing — pick a role, sign in, get to work.
// ──────────────────────────────────────────────────────────────────

type Panel = 'case_manager' | 'case_rep'
type AuthMode = 'login' | 'signup'

const CLASS_META: Record<
  Panel,
  {
    title: string
    accent: 'blue' | 'coral'
    Icon: typeof Shield
  }
> = {
  case_manager: {
    title: 'Case Manager',
    accent: 'blue',
    Icon: Shield,
  },
  case_rep: {
    title: 'Case Rep',
    accent: 'coral',
    Icon: Radio,
  },
}

export default function LandingPage() {
  const router = useRouter()
  // Selector-based subscription: the landing page only cares about
  // session + hydrated, not the whole store. Avoids re-renders on
  // unrelated state (e.g. the auth listener attaching).
  const session = useAuthStore((s) => s.session)
  const hydrated = useAuthStore((s) => s.hydrated)
  const hydrate = useAuthStore((s) => s.hydrate)
  const [selected, setSelected] = useState<Panel | null>(null)

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  useEffect(() => {
    if (hydrated && session) {
      router.replace(homeForRole(session.role))
    }
  }, [hydrated, session, router])

  // Only show the loading spinner if a session exists (user is being
  // redirected) OR we don't yet know whether one exists. Once hydrated
  // confirms no session, render the landing immediately.
  if (session) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy relative overflow-hidden">
      <AmbientBackground />

      {/* Brand row + Admin link */}
      <header className="relative z-10 pt-6 px-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* spacer to keep brand centered on wider screens */}
          <div className="w-32 hidden sm:block" />
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Felicetti Team
            </span>
          </div>
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-coral-400/30 bg-coral-400/10 text-coral-400 text-xs font-bold tracking-wider uppercase hover:bg-coral-400/20 hover:border-coral-400/50 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Admin
          </Link>
        </div>
        {/* mobile-only admin pill */}
        <div className="flex justify-center mt-3 sm:hidden">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-coral-400/30 bg-coral-400/10 text-coral-400 text-xs font-bold tracking-wider uppercase"
          >
            <Settings className="w-3.5 h-3.5" />
            Admin
          </Link>
        </div>
      </header>

      {/* Panels */}
      <main className="relative z-10 px-4 pt-8 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Ambient background
// ──────────────────────────────────────────────────────────────────

function AmbientBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
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
// Role panel
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
        accentText: 'text-blue-400',
        button:
          'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-blue-500/30',
        ghost: 'border-blue-400/30 text-blue-300 hover:bg-blue-400/10',
        iconBg: 'from-blue-400 to-blue-600',
      }
    }
    return {
      border: 'border-coral-400/40',
      borderSelected: 'border-coral-400',
      glow: 'shadow-[0_0_80px_rgba(216,90,48,0.35)]',
      accentText: 'text-coral-400',
      button:
        'bg-gradient-to-r from-coral-400 to-coral-500 hover:from-coral-500 hover:to-coral-400 shadow-coral-400/30',
      ghost: 'border-coral-400/30 text-coral-300 hover:bg-coral-400/10',
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
      {!selected ? (
        <PanelPreview
          title={meta.title}
          accentClasses={accentClasses}
          Icon={Icon}
          panel={panel}
          onSelect={onSelect}
        />
      ) : (
        <PanelAuth panel={panel} accentClasses={accentClasses} onBack={onBack} />
      )}
    </div>
  )
}

function PanelPreview({
  title,
  accentClasses,
  Icon,
  panel,
  onSelect,
}: {
  title: string
  accentClasses: {
    border: string
    borderSelected: string
    glow: string
    accentText: string
    button: string
    ghost: string
    iconBg: string
  }
  Icon: typeof Shield
  panel: Panel
  onSelect: () => void
}) {
  const router = useRouter()
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)

  const handleDemo = async () => {
    setDemoLoading(true)
    setDemoError(null)
    const result = await signInDemo(panel)
    if (!result.ok || !result.session) {
      setDemoError(result.error ?? 'Demo login failed.')
      setDemoLoading(false)
      return
    }
    router.replace(homeForRole(result.session.role))
  }

  return (
    <div className="p-8 flex flex-col h-full min-h-[360px]">
      <div className="flex justify-center my-8">
        <div
          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${accentClasses.iconBg} flex items-center justify-center shadow-2xl`}
        >
          <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight text-center">
        {title}
      </h2>

      {demoError && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{demoError}</span>
        </div>
      )}

      <div className="mt-auto pt-8 space-y-2.5">
        <button
          onClick={onSelect}
          className={`w-full py-3 rounded-lg text-white font-bold tracking-wide shadow-xl transition-all flex items-center justify-center gap-2 ${accentClasses.button}`}
        >
          Sign in <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={handleDemo}
          disabled={demoLoading}
          className={`w-full py-2.5 rounded-lg border font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${accentClasses.ghost}`}
        >
          {demoLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              Try as demo
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Auth form
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
    <div className="p-6 md:p-8 flex flex-col min-h-[360px]">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      <h3 className="text-2xl font-black text-white">
        {mode === 'signup' ? 'Create account' : 'Sign in'}
      </h3>
      <p className={`text-xs font-semibold mt-1 ${accentClasses.accentText}`}>
        {panel === 'case_manager' ? 'Case Manager' : 'Case Rep'}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 flex-1 flex flex-col">
        {mode === 'signup' && (
          <LabelledInput
            label="Full name"
            icon={UserIcon}
            value={fullName}
            onChange={setFullName}
            placeholder="Your name"
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
          className={`mt-1 w-full py-3 rounded-lg text-white font-bold shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${accentClasses.button}`}
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

        <div className="mt-auto pt-3 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup')
              setError(null)
              setConfirmNotice(null)
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

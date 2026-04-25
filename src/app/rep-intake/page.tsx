'use client'

/**
 * Case Rep intake — a stripped-down 9-field form that produces an
 * intake row (status: not_signed) for Case Managers to review.
 *
 * Supports Save & Resume: at any time the rep can hit "Save draft" and
 * the partial form state is persisted to the `intakes` table with
 * is_draft=true. Rep's drafts show up in a list above the form and
 * can be resumed (loads the saved fields) or discarded.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, parseISO } from 'date-fns'
import {
  LogOut,
  Zap,
  Sparkles,
  Check,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Save,
  Trash2,
  FilePen,
} from 'lucide-react'
import { signOut, useAuthStore } from '@/lib/auth'
import {
  discardDraft,
  saveDraft,
  submitIntake,
  useIntakeStore,
  type Intake,
} from '@/lib/intakes'

const MARITAL_OPTIONS = ['Married', 'Single', 'Divorced', 'Never Married']

interface FormState {
  fullName: string
  currentAddress: string
  phone: string
  emergencyPhone: string
  email: string
  dob: string
  ssn: string
  maritalStatus: string
  countryOfBirth: string
}

const emptyForm: FormState = {
  fullName: '',
  currentAddress: '',
  phone: '',
  emergencyPhone: '',
  email: '',
  dob: '',
  ssn: '',
  maritalStatus: '',
  countryOfBirth: '',
}

export default function RepIntakePage() {
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const hydrated = useAuthStore((s) => s.hydrated)
  const hydrate = useAuthStore((s) => s.hydrate)
  const intakes = useIntakeStore((s) => s.intakes)
  const hydrateIntakes = useIntakeStore((s) => s.hydrate)
  const intakesHydrated = useIntakeStore((s) => s.hydrated)

  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ name: string } | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!hydrated) hydrate()
    hydrateIntakes()
  }, [hydrated, hydrate, hydrateIntakes])

  useEffect(() => {
    if (!hydrated) return
    if (!session) {
      router.replace('/')
      return
    }
    if (session.role !== 'case_rep') {
      router.replace('/dashboard')
    }
  }, [hydrated, session, router])

  const myDrafts = useMemo(
    () =>
      intakes.filter(
        (i) => i.is_draft && i.submitted_by_rep_id === session?.id
      ),
    [intakes, session?.id]
  )

  const maskedSSN = useMemo(() => {
    if (form.ssn.length === 0) return ''
    return form.ssn.length > 4 ? '***-**-' + form.ssn.slice(-4) : form.ssn
  }, [form.ssn])

  // Render as soon as we have a rep session, even if `hydrated` hasn't
  // flipped yet — avoids a long blank spinner on cold loads.
  const isRepSession = session?.role === 'case_rep'
  if (!isRepSession) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    )
  }

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => {
      if (!e.has(key)) return e
      const next = new Set(e)
      next.delete(key)
      return next
    })
  }

  const handleSSN = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 9)
    update('ssn', digits)
  }

  const resetForm = () => {
    setForm(emptyForm)
    setErrors(new Set())
    setActiveDraftId(null)
  }

  const handleResume = (draft: Intake) => {
    const data = (draft.draft_data ?? {}) as Partial<FormState>
    setForm({
      fullName: data.fullName ?? draft.full_name ?? '',
      currentAddress: data.currentAddress ?? draft.current_address ?? '',
      phone: data.phone ?? draft.phone ?? '',
      emergencyPhone: data.emergencyPhone ?? draft.emergency_phone ?? '',
      email: data.email ?? draft.email ?? '',
      dob: data.dob ?? draft.dob ?? '',
      ssn: data.ssn ?? '',
      maritalStatus: data.maritalStatus ?? draft.marital_status ?? '',
      countryOfBirth: data.countryOfBirth ?? draft.country_of_birth ?? '',
    })
    setErrors(new Set())
    setActiveDraftId(draft.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDiscardDraft = async (id: string) => {
    setActionError(null)
    const result = await discardDraft(id)
    if (!result.ok) setActionError(result.error ?? 'Could not delete draft.')
    if (activeDraftId === id) resetForm()
  }

  const handleSaveDraft = async () => {
    if (!session) return
    setActionError(null)
    setSavingDraft(true)
    try {
      const result = await saveDraft(
        form as unknown as Record<string, unknown>,
        session.id,
        activeDraftId
      )
      if (!result.ok) {
        setActionError(result.error ?? 'Save failed.')
        return
      }
      setActiveDraftId(result.intake.id)
    } finally {
      setSavingDraft(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    setActionError(null)

    const errs = new Set<string>()
    if (!form.fullName.trim()) errs.add('fullName')
    if (!form.phone.trim()) errs.add('phone')
    if (!form.dob) errs.add('dob')
    setErrors(errs)
    if (errs.size > 0) return

    setSubmitting(true)
    try {
      // If we're submitting a draft, finalize it (update + clear draft flag)
      // by simply inserting a new submission. We then discard the draft row.
      const result = await submitIntake(
        {
          full_name: form.fullName.trim(),
          current_address: form.currentAddress.trim() || undefined,
          phone: form.phone.trim(),
          emergency_phone: form.emergencyPhone.trim() || undefined,
          email: form.email.trim() || undefined,
          dob: form.dob || null,
          ssn_last4: form.ssn.slice(-4) || undefined,
          marital_status: form.maritalStatus || undefined,
          country_of_birth: form.countryOfBirth.trim() || undefined,
        },
        session.id
      )
      if (!result.ok) {
        setActionError(result.error ?? 'Submit failed.')
        return
      }
      if (activeDraftId) {
        await discardDraft(activeDraftId)
      }
      setSuccess({ name: result.intake.full_name })
      resetForm()
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    void signOut()
    router.replace('/')
  }

  return (
    <div className="min-h-screen bg-navy">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-navy/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-coral-400 to-coral-500 rounded">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white leading-tight">
                Felicetti Team · Rep Intake
              </p>
              <p className="text-[11px] text-white/50 leading-tight">
                Logged in as {session.full_name}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log out
          </button>
        </div>
      </header>

      {/* Success screen */}
      {success ? (
        <SuccessScreen
          name={success.name}
          onNew={() => setSuccess(null)}
          onLogout={handleLogout}
        />
      ) : (
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-coral-400 mb-1">
              ◂ {activeDraftId ? 'RESUMING DRAFT' : 'NEW INTAKE'} ▸
            </p>
            <h1 className="text-3xl font-black text-white">Quick intake</h1>
            <p className="text-sm text-white/50 mt-1">
              Capture the basics. A Case Manager will pick it up from the
              dashboard. Use <span className="text-white">Save draft</span> if
              the client can&apos;t finish right now.
            </p>
          </div>

          {/* My drafts */}
          {intakesHydrated && myDrafts.length > 0 && (
            <DraftList
              drafts={myDrafts}
              activeId={activeDraftId}
              onResume={handleResume}
              onDiscard={handleDiscardDraft}
            />
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-navy-50 to-navy-100 rounded-2xl border border-coral-400/20 p-6 md:p-8 shadow-xl space-y-5"
          >
            <Field
              label="Full Name"
              required
              error={errors.has('fullName')}
            >
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="John Doe"
                className={inputCls(errors.has('fullName'))}
              />
            </Field>

            <Field label="Current Address">
              <input
                type="text"
                value={form.currentAddress}
                onChange={(e) => update('currentAddress', e.target.value)}
                placeholder="123 Main St, City, ST 00000"
                className={inputCls(false)}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Phone Number" required error={errors.has('phone')}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="(512) 555-0100"
                  className={inputCls(errors.has('phone'))}
                />
              </Field>
              <Field label="Emergency Contact Phone">
                <input
                  type="tel"
                  value={form.emergencyPhone}
                  onChange={(e) => update('emergencyPhone', e.target.value)}
                  placeholder="(512) 555-0200"
                  className={inputCls(false)}
                />
              </Field>
            </div>

            <Field label="Email Address">
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="client@email.com"
                className={inputCls(false)}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Date of Birth" required error={errors.has('dob')}>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => update('dob', e.target.value)}
                  className={inputCls(errors.has('dob'))}
                />
              </Field>
              <Field
                label="Social Security #"
                helper="Only last 4 digits are shown"
              >
                <input
                  type="text"
                  value={maskedSSN}
                  onFocus={(e) => (e.target.value = form.ssn)}
                  onBlur={(e) => (e.target.value = maskedSSN)}
                  onChange={(e) => handleSSN(e.target.value)}
                  placeholder="***-**-0000"
                  className={inputCls(false)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Marital Status">
                <select
                  value={form.maritalStatus}
                  onChange={(e) => update('maritalStatus', e.target.value)}
                  className={inputCls(false)}
                >
                  <option value="">Select...</option>
                  {MARITAL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Country of Birth">
                <input
                  type="text"
                  value={form.countryOfBirth}
                  onChange={(e) => update('countryOfBirth', e.target.value)}
                  placeholder="USA"
                  className={inputCls(false)}
                />
              </Field>
            </div>

            {(errors.size > 0 || actionError) && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  {actionError ??
                    'Please fill in the required fields marked with *.'}
                </span>
              </div>
            )}

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft || submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/5 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingDraft ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {activeDraftId ? 'Update draft' : 'Save draft'}
                  </>
                )}
              </button>

              <button
                type="submit"
                disabled={submitting || savingDraft}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-coral-400 to-coral-500 hover:from-coral-500 hover:to-coral-400 text-white font-bold shadow-lg shadow-coral-400/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Submit intake
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────
// Drafts list
// ──────────────────────────────────────────────────────────────────

function DraftList({
  drafts,
  activeId,
  onResume,
  onDiscard,
}: {
  drafts: Intake[]
  activeId: string | null
  onResume: (d: Intake) => void
  onDiscard: (id: string) => void
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-navy-50/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <FilePen className="w-4 h-4 text-coral-400" />
        <h2 className="text-sm font-bold text-white">Your saved drafts</h2>
        <span className="ml-auto text-[11px] text-white/40">
          {drafts.length} pending
        </span>
      </div>
      <ul className="space-y-2">
        {drafts.map((d) => (
          <li
            key={d.id}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
              d.id === activeId
                ? 'border-coral-400/50 bg-coral-400/5'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {d.full_name || 'Untitled draft'}
              </p>
              <p className="text-[11px] text-white/40">
                Saved {formatDistanceToNow(parseISO(d.updated_at), { addSuffix: true })}
              </p>
            </div>
            <button
              onClick={() => onResume(d)}
              className="text-xs font-semibold px-2.5 py-1 rounded border border-coral-400/40 text-coral-300 hover:bg-coral-400/10 transition-colors"
            >
              Resume
            </button>
            <button
              onClick={() => onDiscard(d.id)}
              className="p-1.5 rounded text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              title="Discard draft"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ──────────────────────────────────────────────────────────────────
// Success screen
// ──────────────────────────────────────────────────────────────────

function SuccessScreen({
  name,
  onNew,
  onLogout,
}: {
  name: string
  onNew: () => void
  onLogout: () => void
}) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-gradient-to-br from-navy-50 to-navy-100 border border-teal-400/30 rounded-2xl p-10 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-60 animate-pulse" />
            <div className="relative bg-teal-400 rounded-full p-4">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>
        <p className="text-xs font-bold tracking-[0.3em] text-teal-400 mb-2">
          ◂ INTAKE SUBMITTED ▸
        </p>
        <h2 className="text-3xl font-black text-white mb-2">Sent to Ops.</h2>
        <p className="text-white/60 max-w-md mx-auto">
          <span className="text-white font-semibold">{name}</span> is now on the
          Case Manager dashboard. They&apos;ll take it from here.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onNew}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-coral-400 to-coral-500 hover:from-coral-500 hover:to-coral-400 text-white font-bold shadow-lg shadow-coral-400/30 transition-all"
          >
            Submit another <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLogout}
            className="px-6 py-3 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/5 font-semibold transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  )
}

// ──────────────────────────────────────────────────────────────────
// Reusable field shell
// ──────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  helper,
  children,
}: {
  label: string
  required?: boolean
  error?: boolean
  helper?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-wide text-white/70 uppercase mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {helper && (
        <p className="text-[11px] text-white/40 mt-1">{helper}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-400 mt-1">This field is required.</p>
      )}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full px-3 py-2.5 bg-navy/60 border ${
    hasError ? 'border-red-500' : 'border-white/10'
  } rounded-lg text-white placeholder:text-white/30 focus:border-coral-400 focus:outline-none transition-colors text-sm`
}

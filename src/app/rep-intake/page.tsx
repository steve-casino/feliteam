'use client'

/**
 * Case Rep intake — a stripped-down 9-field form that produces an
 * intake row (status: not_signed) for Case Managers to review.
 *
 * Supports Save & Resume: at any time the rep can hit "Save draft" and
 * the partial form state is persisted to the `intakes` table with
 * is_draft=true. Rep's drafts show up in a list above the form and
 * can be resumed (loads the saved fields) or discarded.
 *
 * EN/ES toggle: header includes a LanguageToggle wired to the global
 * useLanguageStore. All visible copy is driven by t.repIntake.* so
 * Spanish-speaking clients can complete the form in Spanish.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { es as esLocale } from 'date-fns/locale'
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
  Paperclip,
} from 'lucide-react'
import { signOut, useAuthStore } from '@/lib/auth'
import {
  discardDraft,
  saveDraft,
  submitIntake,
  useIntakeStore,
  type Intake,
} from '@/lib/intakes'
import AttachmentDropzone from '@/components/intake/AttachmentDropzone'
import LanguageToggle from '@/components/ui/LanguageToggle'
import { useTranslation } from '@/hooks/useLanguage'
import type { translations } from '@/i18n/translations'

type RepIntakeT = (typeof translations)['en']['repIntake']

// Marital option keys map to t.repIntake.marital.* labels.
// Stored value (English) stays stable for downstream consumers.
const MARITAL_OPTIONS: Array<{
  value: string
  key: keyof RepIntakeT['marital']
}> = [
  { value: 'Married', key: 'married' },
  { value: 'Single', key: 'single' },
  { value: 'Divorced', key: 'divorced' },
  { value: 'Never Married', key: 'neverMarried' },
]

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
  const { t, language } = useTranslation()
  const tr = t.repIntake
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
    if (!result.ok) setActionError(result.error ?? tr.errors.deleteDraftFailed)
    if (activeDraftId === id) resetForm()
  }

  // Used by the AttachmentDropzone: when the rep drops a file before
  // there's a draft, we save one on the fly so the file has somewhere
  // to attach to. Returns the resolved intake id (or null on failure).
  const ensureDraftForAttachment = async (): Promise<string | null> => {
    if (activeDraftId) return activeDraftId
    if (!session) return null
    const result = await saveDraft(
      form as unknown as Record<string, unknown>,
      session.id,
      null
    )
    if (!result.ok) {
      setActionError(result.error ?? tr.errors.attachmentDraftFailed)
      return null
    }
    setActiveDraftId(result.intake.id)
    return result.intake.id
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
        setActionError(result.error ?? tr.errors.saveFailed)
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
        setActionError(result.error ?? tr.errors.submitFailed)
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
                {tr.headerTitle}
              </p>
              <p className="text-[11px] text-white/50 leading-tight">
                {tr.loggedInAs.replace('{name}', session.full_name)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {tr.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Success screen */}
      {success ? (
        <SuccessScreen
          name={success.name}
          onNew={() => setSuccess(null)}
          onLogout={handleLogout}
          tr={tr}
        />
      ) : (
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-coral-400 mb-1">
              ◂ {activeDraftId ? tr.resumingDraft : tr.newIntake} ▸
            </p>
            <h1 className="text-3xl font-black text-white">{tr.pageTitle}</h1>
            <p className="text-sm text-white/50 mt-2 leading-relaxed">
              {tr.pageSubtitle.split('{saveDraft}').map((chunk, idx, arr) => (
                <React.Fragment key={idx}>
                  {chunk}
                  {idx < arr.length - 1 && (
                    <span className="text-white font-semibold">
                      {tr.buttons.saveDraft}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>

          {/* My drafts */}
          {intakesHydrated && myDrafts.length > 0 && (
            <DraftList
              drafts={myDrafts}
              activeId={activeDraftId}
              onResume={handleResume}
              onDiscard={handleDiscardDraft}
              tr={tr}
              language={language}
            />
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-navy-50 to-navy-100 rounded-2xl border border-coral-400/20 p-6 md:p-8 shadow-xl space-y-5"
          >
            <Field
              label={tr.fields.fullName}
              required
              error={errors.has('fullName')}
              requiredLabel={tr.errors.fieldRequired}
            >
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder={tr.fields.fullNamePlaceholder}
                className={inputCls(errors.has('fullName'))}
              />
            </Field>

            <Field label={tr.fields.currentAddress}>
              <input
                type="text"
                value={form.currentAddress}
                onChange={(e) => update('currentAddress', e.target.value)}
                placeholder={tr.fields.currentAddressPlaceholder}
                className={inputCls(false)}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label={tr.fields.phone}
                required
                error={errors.has('phone')}
                requiredLabel={tr.errors.fieldRequired}
              >
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder={tr.fields.phonePlaceholder}
                  className={inputCls(errors.has('phone'))}
                />
              </Field>
              <Field label={tr.fields.emergencyPhone}>
                <input
                  type="tel"
                  value={form.emergencyPhone}
                  onChange={(e) => update('emergencyPhone', e.target.value)}
                  placeholder={tr.fields.emergencyPhonePlaceholder}
                  className={inputCls(false)}
                />
              </Field>
            </div>

            <Field label={tr.fields.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder={tr.fields.emailPlaceholder}
                className={inputCls(false)}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label={tr.fields.dob}
                required
                error={errors.has('dob')}
                requiredLabel={tr.errors.fieldRequired}
              >
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => update('dob', e.target.value)}
                  className={inputCls(errors.has('dob'))}
                />
              </Field>
              <Field label={tr.fields.ssn} helper={tr.fields.ssnHelper}>
                <input
                  type="text"
                  value={maskedSSN}
                  onFocus={(e) => (e.target.value = form.ssn)}
                  onBlur={(e) => (e.target.value = maskedSSN)}
                  onChange={(e) => handleSSN(e.target.value)}
                  placeholder={tr.fields.ssnPlaceholder}
                  className={inputCls(false)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label={tr.fields.maritalStatus}>
                <select
                  value={form.maritalStatus}
                  onChange={(e) => update('maritalStatus', e.target.value)}
                  className={inputCls(false)}
                >
                  <option value="">{tr.fields.select}</option>
                  {MARITAL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {tr.marital[opt.key]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={tr.fields.countryOfBirth}>
                <input
                  type="text"
                  value={form.countryOfBirth}
                  onChange={(e) => update('countryOfBirth', e.target.value)}
                  placeholder={tr.fields.countryOfBirthPlaceholder}
                  className={inputCls(false)}
                />
              </Field>
            </div>

            {/* Attachments — photos / IDs / insurance docs / scans */}
            <div className="pt-1">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="w-3.5 h-3.5 text-coral-400" />
                <label className="text-xs font-bold tracking-wide text-white/70 uppercase">
                  {tr.attachments.label}
                </label>
                <span className="text-[10px] text-white/40">
                  {tr.attachments.optional}
                </span>
              </div>
              <AttachmentDropzone
                intakeId={activeDraftId}
                uploaderId={session.id}
                ensureIntakeId={ensureDraftForAttachment}
              />
            </div>

            {(errors.size > 0 || actionError) && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{actionError ?? tr.errors.requiredFields}</span>
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
                    {activeDraftId ? tr.buttons.updateDraft : tr.buttons.saveDraft}
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
                    {tr.buttons.submit}
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
  tr,
  language,
}: {
  drafts: Intake[]
  activeId: string | null
  onResume: (d: Intake) => void
  onDiscard: (id: string) => void
  tr: RepIntakeT
  language: 'en' | 'es'
}) {
  const dfOpts =
    language === 'es'
      ? { addSuffix: true, locale: esLocale }
      : { addSuffix: true }

  return (
    <section className="rounded-xl border border-white/10 bg-navy-50/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <FilePen className="w-4 h-4 text-coral-400" />
        <h2 className="text-sm font-bold text-white">{tr.drafts.title}</h2>
        <span className="ml-auto text-[11px] text-white/40">
          {tr.drafts.pending.replace('{count}', String(drafts.length))}
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
                {d.full_name || tr.drafts.untitled}
              </p>
              <p className="text-[11px] text-white/40">
                {tr.drafts.savedAgo.replace(
                  '{time}',
                  formatDistanceToNow(parseISO(d.updated_at), dfOpts)
                )}
              </p>
            </div>
            <button
              onClick={() => onResume(d)}
              className="text-xs font-semibold px-2.5 py-1 rounded border border-coral-400/40 text-coral-300 hover:bg-coral-400/10 transition-colors"
            >
              {tr.drafts.resume}
            </button>
            <button
              onClick={() => onDiscard(d.id)}
              className="p-1.5 rounded text-white/40 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              title={tr.drafts.discard}
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
  tr,
}: {
  name: string
  onNew: () => void
  onLogout: () => void
  tr: RepIntakeT
}) {
  // Body string contains "{name}" — split + bold the inserted name.
  const bodyParts = tr.success.body.split('{name}')
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
          ◂ {tr.success.eyebrow} ▸
        </p>
        <h2 className="text-3xl font-black text-white mb-2">{tr.success.title}</h2>
        <p className="text-white/60 max-w-md mx-auto">
          {bodyParts.map((chunk, idx, arr) => (
            <React.Fragment key={idx}>
              {chunk}
              {idx < arr.length - 1 && (
                <span className="text-white font-semibold">{name}</span>
              )}
            </React.Fragment>
          ))}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onNew}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-coral-400 to-coral-500 hover:from-coral-500 hover:to-coral-400 text-white font-bold shadow-lg shadow-coral-400/30 transition-all"
          >
            {tr.success.another} <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLogout}
            className="px-6 py-3 rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/5 font-semibold transition-colors"
          >
            {tr.logout}
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
  requiredLabel,
  children,
}: {
  label: string
  required?: boolean
  error?: boolean
  helper?: string
  requiredLabel?: string
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
        <p className="text-[11px] text-red-400 mt-1">
          {requiredLabel ?? 'This field is required.'}
        </p>
      )}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full px-3 py-2.5 bg-navy/60 border ${
    hasError ? 'border-red-500' : 'border-white/10'
  } rounded-lg text-white placeholder:text-white/30 focus:border-coral-400 focus:outline-none transition-colors text-sm`
}

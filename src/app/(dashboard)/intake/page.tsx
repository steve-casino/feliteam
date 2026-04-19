'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from '@/hooks/useLanguage'
import LanguageToggle from '@/components/ui/LanguageToggle'
import BodyDiagram from '@/components/intake/BodyDiagram'
import CarDiagram from '@/components/intake/CarDiagram'
import { mockUsers } from '@/lib/mock-data'
import {
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  AlertCircle,
  Zap,
  Sparkles,
  User,
  Car,
  FileText,
  Activity,
  Shield,
  ClipboardList,
} from 'lucide-react'

// ───────────────────────────────────────────────────────────────────
// Constants
// ───────────────────────────────────────────────────────────────────

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

const VEHICLE_TYPES = ['Car', 'Truck', 'Motorcycle', 'Van', 'Pick Up', 'Bicycle', 'Scooter', 'Moped']
const VEHICLE_TYPES_ES = ['Carro', 'Camión', 'Motocicleta', 'Van', 'Camioneta', 'Bicicleta', 'Scooter', 'Ciclomotor']

const DAMAGE_LEVELS = ['Total Loss', 'Substantial', 'Medium', 'Slight', 'None']
const DAMAGE_LEVELS_ES = ['Pérdida Total', 'Sustancial', 'Medio', 'Leve', 'Ninguno']

const IMPACT_LEVELS = ['Very Heavy', 'Heavy', 'Medium', 'Light', 'Very Light']
const IMPACT_LEVELS_ES = ['Muy Fuerte', 'Fuerte', 'Medio', 'Leve', 'Muy Leve']

const MARITAL_OPTIONS = ['Married', 'Single', 'Divorced', 'Never Married']
const MARITAL_OPTIONS_ES = ['Casado/a', 'Soltero/a', 'Divorciado/a', 'Nunca Casado/a']

const STEP_LABELS_EN = ['Your Info', 'Accident', 'Injuries', 'Your Vehicle', 'Other Vehicle', 'Review']
const STEP_LABELS_ES = ['Tu Info', 'Accidente', 'Lesiones', 'Tu Vehículo', 'Otro Vehículo', 'Revisión']

const SECTION_COLORS = ['bg-coral-400', 'bg-blue-500', 'bg-red-500', 'bg-coral-400', 'bg-blue-500', 'bg-purple-400']
const SECTION_BORDER_COLORS = ['border-coral-400', 'border-blue-500', 'border-red-500', 'border-coral-400', 'border-blue-500', 'border-purple-400']

// ───────────────────────────────────────────────────────────────────
// Bilingual labels
// ───────────────────────────────────────────────────────────────────

const L = (en: string, es: string, lang: string) => lang === 'en' ? en : es

// ───────────────────────────────────────────────────────────────────
// Form state interfaces
// ───────────────────────────────────────────────────────────────────

interface PersonalInfo {
  fullName: string
  currentAddress: string
  phone: string
  emergencyPhone: string
  email: string
  dob: string
  ssn: string
  maritalStatus: string
  spouseName: string
  countryOfBirth: string
  wasWorking: string
  roleInAccident: string
  hasOwnVehicle: string
  passengers: string
}

interface AccidentInfo {
  dateOfAccident: string
  timeOfAccident: string
  streetName: string
  townOrCity: string
  state: string
  policeCalled: string
  policeCameToLocation: string
  respondingDepartment: string
  policeCaseNumber: string
  policeCitation: string
  receivedCitation: string
  citationDetails: string
  impactLevel: string
  accidentDescription: string
}

interface InjuryInfo {
  medicareEligible: string
  ambulanceCame: string
  ambulanceTreated: string
  ambulanceTransported: string
  hospitalName: string
  injuryDescription: string
}

interface VehicleInfo {
  vehicleType: string
  operator: string
  owner: string
  year: string
  make: string
  model: string
  plateAndState: string
  isInsured: string
  insuranceCompany: string
  policyNumber: string
  damageLevel: string
  wasTowed: string
}

interface ReviewInfo {
  referralCode: string
  preparedBy: string
}

// ───────────────────────────────────────────────────────────────────
// Helper: today's date as YYYY-MM-DD
// ───────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ───────────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────────

const IntakePage: React.FC = () => {
  const { t, language } = useTranslation()

  // Step
  const [currentStep, setCurrentStep] = useState(1)
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set())
  const [transitioning, setTransitioning] = useState(false)

  // Form state
  const [personal, setPersonal] = useState<PersonalInfo>({
    fullName: '', currentAddress: '', phone: '', emergencyPhone: '',
    email: '', dob: '', ssn: '', maritalStatus: '', spouseName: '',
    countryOfBirth: '', wasWorking: '', roleInAccident: '', hasOwnVehicle: '', passengers: '',
  })
  const [accident, setAccident] = useState<AccidentInfo>({
    dateOfAccident: '', timeOfAccident: '', streetName: '', townOrCity: '',
    state: '', policeCalled: '', policeCameToLocation: '', respondingDepartment: '',
    policeCaseNumber: '', policeCitation: '', receivedCitation: '', citationDetails: '',
    impactLevel: '', accidentDescription: '',
  })
  const [injury, setInjury] = useState<InjuryInfo>({
    medicareEligible: '', ambulanceCame: '', ambulanceTreated: '',
    ambulanceTransported: '', hospitalName: '', injuryDescription: '',
  })
  const [yourVehicle, setYourVehicle] = useState<VehicleInfo>({
    vehicleType: '', operator: '', owner: '', year: '', make: '', model: '',
    plateAndState: '', isInsured: '', insuranceCompany: '', policyNumber: '',
    damageLevel: '', wasTowed: '',
  })
  const [otherVehicle, setOtherVehicle] = useState<VehicleInfo>({
    vehicleType: '', operator: '', owner: '', year: '', make: '', model: '',
    plateAndState: '', isInsured: '', insuranceCompany: '', policyNumber: '',
    damageLevel: '', wasTowed: '',
  })
  const [review, setReview] = useState<ReviewInfo>({ referralCode: '', preparedBy: '' })

  // Diagrams
  const [injuredBodyParts, setInjuredBodyParts] = useState<string[]>([])
  const [yourVehicleDamage, setYourVehicleDamage] = useState<string[]>([])
  const [otherVehicleDamage, setOtherVehicleDamage] = useState<string[]>([])

  // Submission
  const [showSuccess, setShowSuccess] = useState(false)
  const [generatedCaseNumber, setGeneratedCaseNumber] = useState('')
  const [assignedCaseManager, setAssignedCaseManager] = useState<(typeof mockUsers)[number] | null>(null)

  // ─── Derived flags ───

  const isMinor = useMemo(() => {
    if (!personal.dob) return false
    const birth = new Date(personal.dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age < 18
  }, [personal.dob])

  const noPoliceReport = !accident.policeCaseNumber.trim()
  const missingInsurance = yourVehicle.isInsured === 'no' || (!yourVehicle.insuranceCompany && !yourVehicle.policyNumber && yourVehicle.isInsured !== 'yes')

  // ─── Handlers ───

  const up = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setter(prev => ({ ...prev, [name]: value }))
      setValidationErrors(prev => { const n = new Set(prev); n.delete(name); return n })
    }

  const upRadio = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, field: string, value: string) => {
    setter(prev => ({ ...prev, [field]: value }))
    setValidationErrors(prev => { const n = new Set(prev); n.delete(field); return n })
  }

  const toggleBodyPart = (part: string) =>
    setInjuredBodyParts(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part])
  const toggleYourDamage = (zone: string) =>
    setYourVehicleDamage(prev => prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone])
  const toggleOtherDamage = (zone: string) =>
    setOtherVehicleDamage(prev => prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone])

  // ─── SSN masking ───

  const handleSSN = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9)
    setPersonal(prev => ({ ...prev, ssn: raw }))
  }
  const maskedSSN = personal.ssn.length > 0
    ? '***-**-' + (personal.ssn.length > 5 ? personal.ssn.slice(5) : personal.ssn.slice(-Math.min(personal.ssn.length, 4)))
    : ''

  // ─── Validation per step ───

  const validateStep = (step: number): boolean => {
    const errors = new Set<string>()
    if (step === 1) {
      if (!personal.fullName.trim()) errors.add('fullName')
      if (!personal.phone.trim()) errors.add('phone')
      if (!personal.dob) errors.add('dob')
    } else if (step === 2) {
      if (!accident.dateOfAccident) errors.add('dateOfAccident')
      if (!accident.state) errors.add('state')
      if (!accident.accidentDescription.trim()) errors.add('accidentDescription')
    }
    // Steps 3-5 have no hard required fields blocking navigation
    setValidationErrors(errors)
    return errors.size === 0
  }

  // ─── Navigation ───

  const goToStep = (step: number) => {
    setTransitioning(true)
    setTimeout(() => {
      setCurrentStep(step)
      setTransitioning(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 150)
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) return
    if (currentStep < 6) goToStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) goToStep(currentStep - 1)
  }

  // ─── Submit ───

  const generateCaseNumber = () => Math.floor(100000 + Math.random() * 900000).toString()

  const getCaseManager = () => {
    const cms = mockUsers.filter(u => u.role === 'case_manager')
    // Least loaded = lowest XP as a proxy for fewest cases
    return cms.length > 0 ? cms.reduce((a, b) => a.xp_points <= b.xp_points ? a : b) : mockUsers[0]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setGeneratedCaseNumber(generateCaseNumber())
    setAssignedCaseManager(getCaseManager())
    setShowSuccess(true)
  }

  // ─── Shared UI helpers ───

  const inputCls = (field?: string) =>
    `w-full bg-navy border ${field && validationErrors.has(field) ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none transition-colors`

  const selectCls = (field?: string) => inputCls(field)

  const labelCls = 'block text-sm font-semibold text-white mb-1.5'

  const requiredStar = <span className="text-red-400 ml-0.5">*</span>

  const radioGroup = (
    name: string, value: string,
    setter: React.Dispatch<React.SetStateAction<any>>,
    field: string
  ) => (
    <div className="flex gap-4">
      {['yes', 'no'].map(v => (
        <label key={v} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio" name={name} checked={value === v}
            onChange={() => upRadio(setter, field, v)}
            className="w-4 h-4 accent-purple-400"
          />
          <span className="text-white text-sm">{v === 'yes' ? L('Yes', 'Sí', language) : 'No'}</span>
        </label>
      ))}
    </div>
  )

  const sectionHeader = (stepIdx: number, titleEn: string, titleEs: string) => (
    <div className="flex items-stretch mb-6 overflow-hidden rounded-lg">
      <div className={`w-2 ${SECTION_COLORS[stepIdx]} flex-shrink-0`} />
      <div className={`flex-1 bg-navy-50 border ${SECTION_BORDER_COLORS[stepIdx]} border-l-0 rounded-r-lg px-5 py-3`}>
        <h2 className="text-xl font-bold text-white">{L(titleEn, titleEs, language)}</h2>
      </div>
    </div>
  )

  // ───────────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ───────────────────────────────────────────────────────────────

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {/* Confetti particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `bounce ${1.5 + Math.random() * 1.5}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 0.8}s`,
                }}
              >
                <Sparkles className={`w-4 h-4 ${['text-purple-400','text-teal-400','text-coral-400'][i % 3]}`} />
              </div>
            ))}
          </div>

          <div className="relative z-10 bg-gradient-to-br from-navy-50 to-navy-200 rounded-2xl border border-purple-400/30 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-400 rounded-full blur-lg opacity-50 animate-pulse" />
                <div className="relative bg-teal-400 rounded-full p-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              {L('Case Submitted Successfully!', 'Caso Enviado Exitosamente!', language)}
            </h2>
            <p className="text-white/70 mb-6">
              {L('Felicetti Law Firm — Motor Vehicle Intake', 'Felicetti Law Firm — Admisión de Vehículo Motor', language)}
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-navy rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1">{L('Case Number', 'Número de Caso', language)}</p>
                <p className="text-2xl font-bold text-purple-400">{generatedCaseNumber}</p>
              </div>

              {assignedCaseManager && (
                <div className="bg-navy rounded-lg p-4 border border-white/10">
                  <p className="text-white/60 text-sm mb-1">{L('Assigned Case Manager', 'Gerente de Caso Asignado', language)}</p>
                  <p className="text-lg font-semibold text-teal-400">{assignedCaseManager.full_name}</p>
                </div>
              )}

              {/* Flags */}
              <div className="space-y-2 text-left">
                {isMinor && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-300">{L('MINOR DETECTED — Attorney Escalation Required', 'MENOR DETECTADO — Escalación al Abogado Requerida', language)}</span>
                  </div>
                )}
                {missingInsurance && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-orange-300">{L('Missing insurance information', 'Falta información del seguro', language)}</span>
                  </div>
                )}
                {noPoliceReport && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-amber-300">{L('No police report — flagged for follow-up within 7 days', 'Sin reporte policial — marcado para seguimiento en 7 días', language)}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setShowSuccess(false)
                setCurrentStep(1)
                setPersonal({ fullName: '', currentAddress: '', phone: '', emergencyPhone: '', email: '', dob: '', ssn: '', maritalStatus: '', spouseName: '', countryOfBirth: '', wasWorking: '', roleInAccident: '', hasOwnVehicle: '', passengers: '' })
                setAccident({ dateOfAccident: '', timeOfAccident: '', streetName: '', townOrCity: '', state: '', policeCalled: '', policeCameToLocation: '', respondingDepartment: '', policeCaseNumber: '', policeCitation: '', receivedCitation: '', citationDetails: '', impactLevel: '', accidentDescription: '' })
                setInjury({ medicareEligible: '', ambulanceCame: '', ambulanceTreated: '', ambulanceTransported: '', hospitalName: '', injuryDescription: '' })
                setYourVehicle({ vehicleType: '', operator: '', owner: '', year: '', make: '', model: '', plateAndState: '', isInsured: '', insuranceCompany: '', policyNumber: '', damageLevel: '', wasTowed: '' })
                setOtherVehicle({ vehicleType: '', operator: '', owner: '', year: '', make: '', model: '', plateAndState: '', isInsured: '', insuranceCompany: '', policyNumber: '', damageLevel: '', wasTowed: '' })
                setReview({ referralCode: '', preparedBy: '' })
                setInjuredBodyParts([])
                setYourVehicleDamage([])
                setOtherVehicleDamage([])
              }}
              className="w-full bg-purple-400 hover:bg-purple-500 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {L('Create Another Case', 'Crear Otro Caso', language)}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ───────────────────────────────────────────────────────────────
  // STEP INDICATOR
  // ───────────────────────────────────────────────────────────────

  const stepLabels = language === 'en' ? STEP_LABELS_EN : STEP_LABELS_ES

  const renderStepIndicator = () => (
    <div className="mb-10">
      {/* Circles + lines */}
      <div className="flex items-center justify-between mb-3">
        {[1, 2, 3, 4, 5, 6].map((step, idx) => (
          <div key={step} className="flex items-center flex-1 last:flex-initial">
            <div
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-xs md:text-sm transition-all flex-shrink-0 ${
                step < currentStep
                  ? 'bg-teal-400 text-white'
                  : step === currentStep
                  ? 'bg-purple-400 text-white'
                  : 'bg-navy-200 text-white/50'
              }`}
            >
              {step < currentStep ? <Check className="w-4 h-4" /> : step}
            </div>
            {idx < 5 && (
              <div className={`flex-1 h-0.5 mx-1 md:mx-2 rounded transition-all ${step < currentStep ? 'bg-teal-400' : 'bg-navy-200'}`} />
            )}
          </div>
        ))}
      </div>
      {/* Labels */}
      <div className="grid grid-cols-6 gap-1">
        {stepLabels.map((label, i) => (
          <p key={i} className={`text-center text-[10px] md:text-xs font-medium ${i + 1 === currentStep ? 'text-purple-400' : i + 1 < currentStep ? 'text-teal-400' : 'text-white/40'}`}>
            {label}
          </p>
        ))}
      </div>
    </div>
  )

  // ───────────────────────────────────────────────────────────────
  // STEP 1: YOUR INFORMATION
  // ───────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-5">
      {sectionHeader(0, 'YOUR INFORMATION', 'TU INFORMACIÓN')}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className={labelCls}>{L('Full Name', 'Nombre Completo', language)}{requiredStar}</label>
          <input type="text" name="fullName" value={personal.fullName} onChange={up(setPersonal)} className={inputCls('fullName')} placeholder="John Doe" />
        </div>

        {/* Current Address */}
        <div>
          <label className={labelCls}>{L('Current Address', 'Dirección Actual', language)}</label>
          <input type="text" name="currentAddress" value={personal.currentAddress} onChange={up(setPersonal)} className={inputCls()} placeholder="123 Main St, City, ST 00000" />
        </div>

        {/* Phone Number */}
        <div>
          <label className={labelCls}>{L('Phone Number', 'Número de Teléfono', language)}{requiredStar}</label>
          <input type="tel" name="phone" value={personal.phone} onChange={up(setPersonal)} className={inputCls('phone')} placeholder="(512) 555-0100" />
        </div>

        {/* Emergency Contact Phone */}
        <div>
          <label className={labelCls}>{L('Emergency Contact Phone', 'Teléfono de Contacto de Emergencia', language)}</label>
          <input type="tel" name="emergencyPhone" value={personal.emergencyPhone} onChange={up(setPersonal)} className={inputCls()} placeholder="(512) 555-0200" />
        </div>

        {/* Email Address */}
        <div>
          <label className={labelCls}>{L('Email Address', 'Correo Electrónico', language)}</label>
          <input type="email" name="email" value={personal.email} onChange={up(setPersonal)} className={inputCls()} placeholder="client@email.com" />
        </div>

        {/* Date of Birth */}
        <div>
          <label className={labelCls}>{L('Date of Birth', 'Fecha de Nacimiento', language)}{requiredStar}</label>
          <input type="date" name="dob" value={personal.dob} onChange={up(setPersonal)} className={inputCls('dob')} />
        </div>
      </div>

      {/* Minor Warning */}
      {isMinor && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
          <span className="text-base font-semibold text-red-300">
            {L('⚠️ MINOR DETECTED — Attorney Escalation Required', '⚠️ MENOR DETECTADO — Escalación al Abogado Requerida', language)}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SSN */}
        <div>
          <label className={labelCls}>{L('Social Security #', 'Número de Seguro Social', language)}</label>
          <input
            type="text" name="ssn"
            value={maskedSSN}
            onChange={handleSSN}
            onFocus={(e) => { e.target.value = personal.ssn }}
            onBlur={(e) => { e.target.value = maskedSSN }}
            className={inputCls()}
            placeholder="***-**-0000"
          />
          <p className="text-xs text-white/40 mt-1">{L('Only last 4 digits are shown', 'Solo se muestran los últimos 4 dígitos', language)}</p>
        </div>

        {/* Marital Status */}
        <div>
          <label className={labelCls}>{L('Marital Status', 'Estado Civil', language)}</label>
          <select name="maritalStatus" value={personal.maritalStatus} onChange={up(setPersonal)} className={selectCls()}>
            <option value="">{L('Select...', 'Seleccionar...', language)}</option>
            {MARITAL_OPTIONS.map((opt, i) => (
              <option key={opt} value={opt}>{language === 'en' ? opt : MARITAL_OPTIONS_ES[i]}</option>
            ))}
          </select>
        </div>

        {/* Spouse Name (conditional) */}
        {personal.maritalStatus === 'Married' && (
          <div>
            <label className={labelCls}>{L("Spouse's Name", 'Nombre del Cónyuge', language)}</label>
            <input type="text" name="spouseName" value={personal.spouseName} onChange={up(setPersonal)} className={inputCls()} />
          </div>
        )}

        {/* Country of Birth */}
        <div>
          <label className={labelCls}>{L('Country of Birth', 'País de Nacimiento', language)}</label>
          <input type="text" name="countryOfBirth" value={personal.countryOfBirth} onChange={up(setPersonal)} className={inputCls()} placeholder={L('USA', 'EE.UU.', language)} />
        </div>
      </div>

      {/* Were you working? */}
      <div>
        <label className={labelCls}>{L('At time of accident, were you working?', 'Al momento del accidente, ¿estaba trabajando?', language)}</label>
        {radioGroup('wasWorking', personal.wasWorking, setPersonal, 'wasWorking')}
      </div>

      {/* Role in accident */}
      <div>
        <label className={labelCls}>{L('At time of accident YOU were:', 'Al momento del accidente USTED era:', language)}</label>
        <div className="flex flex-wrap gap-4">
          {['Driver', 'Passenger', 'Pedestrian'].map(role => (
            <label key={role} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio" name="roleInAccident"
                checked={personal.roleInAccident === role}
                onChange={() => upRadio(setPersonal, 'roleInAccident', role)}
                className="w-4 h-4 accent-purple-400"
              />
              <span className="text-white text-sm">
                {L(role, role === 'Driver' ? 'Conductor' : role === 'Passenger' ? 'Pasajero' : 'Peatón', language)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Own vehicle */}
      <div>
        <label className={labelCls}>{L('Do you have your own vehicle?', '¿Tiene su propio vehículo?', language)}</label>
        {radioGroup('hasOwnVehicle', personal.hasOwnVehicle, setPersonal, 'hasOwnVehicle')}
      </div>

      {/* Passengers */}
      <div>
        <label className={labelCls}>{L('Any passengers?', '¿Algún pasajero?', language)}</label>
        <input type="text" name="passengers" value={personal.passengers} onChange={up(setPersonal)} className={inputCls()} placeholder={L('Names of passengers', 'Nombres de pasajeros', language)} />
      </div>
    </div>
  )

  // ───────────────────────────────────────────────────────────────
  // STEP 2: ACCIDENT INFORMATION
  // ───────────────────────────────────────────────────────────────

  const renderStep2 = () => (
    <div className="space-y-5">
      {sectionHeader(1, 'ACCIDENT INFORMATION', 'INFORMACIÓN DEL ACCIDENTE')}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date of Accident */}
        <div>
          <label className={labelCls}>{L('Date of Accident', 'Fecha del Accidente', language)}{requiredStar}</label>
          <input type="date" name="dateOfAccident" value={accident.dateOfAccident} onChange={up(setAccident)} className={inputCls('dateOfAccident')} />
        </div>

        {/* Time of Accident */}
        <div>
          <label className={labelCls}>{L('Time of Accident', 'Hora del Accidente', language)}</label>
          <input type="time" name="timeOfAccident" value={accident.timeOfAccident} onChange={up(setAccident)} className={inputCls()} />
        </div>

        {/* Street */}
        <div>
          <label className={labelCls}>{L('Street Name or Roadway', 'Nombre de Calle o Carretera', language)}</label>
          <input type="text" name="streetName" value={accident.streetName} onChange={up(setAccident)} className={inputCls()} />
        </div>

        {/* Town or City */}
        <div>
          <label className={labelCls}>{L('Town or City', 'Pueblo o Ciudad', language)}</label>
          <input type="text" name="townOrCity" value={accident.townOrCity} onChange={up(setAccident)} className={inputCls()} />
        </div>

        {/* State */}
        <div className="md:col-span-2">
          <label className={labelCls}>{L('State of Accident', 'Estado del Accidente', language)}{requiredStar}</label>
          <select name="state" value={accident.state} onChange={up(setAccident)} className={selectCls('state')}>
            <option value="">{L('Select a state', 'Selecciona un estado', language)}</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* TX info box */}
      {accident.state === 'TX' && (
        <div className="bg-teal-400/10 border border-teal-400/30 rounded-lg p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-teal-300">TX Default Limits: BI $30,000 | PD $25,000</span>
        </div>
      )}

      {/* Police questions */}
      <div className="space-y-4">
        <div>
          <label className={labelCls}>{L('Were Police Called?', '¿Se llamó a la policía?', language)}</label>
          {radioGroup('policeCalled', accident.policeCalled, setAccident, 'policeCalled')}
        </div>

        <div>
          <label className={labelCls}>{L('Did Police Come to Accident Location?', '¿La policía llegó al lugar del accidente?', language)}</label>
          {radioGroup('policeCameToLocation', accident.policeCameToLocation, setAccident, 'policeCameToLocation')}
        </div>

        {(accident.policeCalled === 'yes') && (
          <div>
            <label className={labelCls}>{L('Name of Responding Police Department', 'Nombre del Departamento de Policía que Respondió', language)}</label>
            <input type="text" name="respondingDepartment" value={accident.respondingDepartment} onChange={up(setAccident)} className={inputCls()} />
          </div>
        )}

        <div>
          <label className={labelCls}>{L('Police Case # or Report #', 'Caso Policial # o Reporte #', language)}</label>
          <input type="text" name="policeCaseNumber" value={accident.policeCaseNumber} onChange={up(setAccident)} className={inputCls()} placeholder="APD-2024-451802" />
          {!accident.policeCaseNumber.trim() && (
            <div className="mt-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-amber-300">{L('No police report — will be flagged for follow-up within 7 days', 'Sin reporte policial — se marcará para seguimiento en 7 días', language)}</span>
            </div>
          )}
        </div>

        <div>
          <label className={labelCls}>{L('Did Police Issue a Citation to Anyone?', '¿La policía emitió una citación a alguien?', language)}</label>
          {radioGroup('policeCitation', accident.policeCitation, setAccident, 'policeCitation')}
        </div>

        <div>
          <label className={labelCls}>{L('Did You Receive a Citation or Ticket?', '¿Recibió usted una citación o multa?', language)}</label>
          {radioGroup('receivedCitation', accident.receivedCitation, setAccident, 'receivedCitation')}
        </div>

        {accident.receivedCitation === 'yes' && (
          <div>
            <label className={labelCls}>{L('Citation Details', 'Detalles de la Citación', language)}</label>
            <input type="text" name="citationDetails" value={accident.citationDetails} onChange={up(setAccident)} className={inputCls()} />
          </div>
        )}

        {/* Impact */}
        <div>
          <label className={labelCls}>{L('Impact of Accident', 'Impacto del Accidente', language)}</label>
          <select name="impactLevel" value={accident.impactLevel} onChange={up(setAccident)} className={selectCls()}>
            <option value="">{L('Select...', 'Seleccionar...', language)}</option>
            {IMPACT_LEVELS.map((lvl, i) => (
              <option key={lvl} value={lvl}>{language === 'en' ? lvl : IMPACT_LEVELS_ES[i]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>{L('Description of Accident', 'Descripción del Accidente', language)}{requiredStar}</label>
        <textarea
          name="accidentDescription" value={accident.accidentDescription} onChange={up(setAccident)}
          rows={6}
          className={`${inputCls('accidentDescription')} resize-none`}
          placeholder={L('Describe what happened in detail...', 'Describa lo que pasó en detalle...', language)}
        />
      </div>
    </div>
  )

  // ───────────────────────────────────────────────────────────────
  // STEP 3: INJURY DETAILS
  // ───────────────────────────────────────────────────────────────

  const renderStep3 = () => (
    <div className="space-y-5">
      {sectionHeader(2, 'INJURY DETAILS', 'DETALLES DE LESIONES')}

      <div>
        <label className={labelCls}>{L('Do you have or are you eligible for Medicare/Medicaid?', '¿Tiene o es elegible para Medicare/Medicaid?', language)}</label>
        {radioGroup('medicareEligible', injury.medicareEligible, setInjury, 'medicareEligible')}
      </div>

      <div>
        <label className={labelCls}>{L('Did Ambulance come to Accident Location?', '¿Llegó la ambulancia al lugar del accidente?', language)}</label>
        {radioGroup('ambulanceCame', injury.ambulanceCame, setInjury, 'ambulanceCame')}
      </div>

      <div>
        <label className={labelCls}>{L('Did Ambulance personnel treat you at Accident Location?', '¿El personal de la ambulancia lo trató en el lugar del accidente?', language)}</label>
        {radioGroup('ambulanceTreated', injury.ambulanceTreated, setInjury, 'ambulanceTreated')}
      </div>

      <div>
        <label className={labelCls}>{L('Did Ambulance personnel transport you to Hospital?', '¿El personal de la ambulancia lo transportó al hospital?', language)}</label>
        {radioGroup('ambulanceTransported', injury.ambulanceTransported, setInjury, 'ambulanceTransported')}
      </div>

      {injury.ambulanceTransported === 'yes' && (
        <div>
          <label className={labelCls}>{L('Hospital Name', 'Nombre del Hospital', language)}</label>
          <input type="text" name="hospitalName" value={injury.hospitalName} onChange={up(setInjury)} className={inputCls()} />
        </div>
      )}

      <div>
        <label className={labelCls}>{L('Describe in your own words the injuries you are suffering', 'Describa en sus propias palabras las lesiones que sufre', language)}</label>
        <textarea
          name="injuryDescription" value={injury.injuryDescription} onChange={up(setInjury)}
          rows={5} className={`${inputCls()} resize-none`}
          placeholder={L('Describe your injuries...', 'Describa sus lesiones...', language)}
        />
      </div>

      {/* Body Diagram */}
      <div className="mt-6">
        <label className={`${labelCls} mb-3`}>
          {L('Mark each body part you sustained injury in this accident', 'Marque cada parte del cuerpo en la que sufrió lesiones en este accidente', language)}
        </label>
        <div className="bg-navy rounded-xl border border-white/10 p-4">
          <BodyDiagram
            selectedParts={injuredBodyParts}
            onTogglePart={toggleBodyPart}
            language={language as 'en' | 'es'}
          />
        </div>
        {injuredBodyParts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {injuredBodyParts.map(part => (
              <span key={part} className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 rounded px-2 py-0.5">
                {part.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ───────────────────────────────────────────────────────────────
  // STEP 4: YOUR VEHICLE DETAILS
  // ───────────────────────────────────────────────────────────────

  const renderVehicleForm = (
    data: VehicleInfo,
    setter: React.Dispatch<React.SetStateAction<VehicleInfo>>,
    prefix: string,
  ) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>{L('Vehicle Type', 'Tipo de Vehículo', language)}</label>
          <select name="vehicleType" value={data.vehicleType} onChange={up(setter)} className={selectCls()}>
            <option value="">{L('Select...', 'Seleccionar...', language)}</option>
            {VEHICLE_TYPES.map((vt, i) => (
              <option key={vt} value={vt}>{language === 'en' ? vt : VEHICLE_TYPES_ES[i]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>{L('Operator at time of accident', 'Operador al momento del accidente', language)}</label>
          <input type="text" name="operator" value={data.operator} onChange={up(setter)} className={inputCls()} />
        </div>

        <div>
          <label className={labelCls}>{L('Owner of vehicle', 'Propietario del vehículo', language)}</label>
          <input type="text" name="owner" value={data.owner} onChange={up(setter)} className={inputCls()} />
        </div>

        <div>
          <label className={labelCls}>{L('Year', 'Año', language)}</label>
          <input type="text" name="year" value={data.year} onChange={up(setter)} className={inputCls()} placeholder="2022" />
        </div>

        <div>
          <label className={labelCls}>{L('Make', 'Marca', language)}</label>
          <input type="text" name="make" value={data.make} onChange={up(setter)} className={inputCls()} placeholder="Toyota" />
        </div>

        <div>
          <label className={labelCls}>{L('Model', 'Modelo', language)}</label>
          <input type="text" name="model" value={data.model} onChange={up(setter)} className={inputCls()} placeholder="Camry" />
        </div>

        <div>
          <label className={labelCls}>{L('Plate and State', 'Placa y Estado', language)}{prefix === 'other' ? ' / VIN' : ''}</label>
          <input type="text" name="plateAndState" value={data.plateAndState} onChange={up(setter)} className={inputCls()} placeholder="ABC-1234 TX" />
        </div>

        <div>
          <label className={labelCls}>{L('Was vehicle insured?', '¿Estaba asegurado el vehículo?', language)}</label>
          {radioGroup(`${prefix}_isInsured`, data.isInsured, setter, 'isInsured')}
        </div>

        {data.isInsured === 'yes' && (
          <>
            <div>
              <label className={labelCls}>{L('Insurance Company', 'Compañía de Seguros', language)}</label>
              <input type="text" name="insuranceCompany" value={data.insuranceCompany} onChange={up(setter)} className={inputCls()} />
            </div>
            <div>
              <label className={labelCls}>{L('Insurance Policy # or Claim #', 'Póliza de Seguro # o Reclamo #', language)}</label>
              <input type="text" name="policyNumber" value={data.policyNumber} onChange={up(setter)} className={inputCls()} />
            </div>
          </>
        )}

        <div>
          <label className={labelCls}>{L('Damage to vehicle', 'Daño al vehículo', language)}</label>
          <select name="damageLevel" value={data.damageLevel} onChange={up(setter)} className={selectCls()}>
            <option value="">{L('Select...', 'Seleccionar...', language)}</option>
            {DAMAGE_LEVELS.map((dl, i) => (
              <option key={dl} value={dl}>{language === 'en' ? dl : DAMAGE_LEVELS_ES[i]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>{L('Was vehicle towed from the scene?', '¿Fue remolcado el vehículo de la escena?', language)}</label>
          {radioGroup(`${prefix}_wasTowed`, data.wasTowed, setter, 'wasTowed')}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-5">
      {sectionHeader(3, 'YOUR VEHICLE DETAILS', 'DETALLES DE TU VEHÍCULO')}

      {renderVehicleForm(yourVehicle, setYourVehicle, 'your')}

      {/* Car Diagram */}
      <div className="mt-6">
        <label className={`${labelCls} mb-3`}>
          {L('Mark the damaged areas on YOUR VEHICLE', 'Marque las áreas dañadas en TU VEHÍCULO', language)}
        </label>
        <div className="bg-navy rounded-xl border border-white/10 p-4">
          <CarDiagram
            selectedZones={yourVehicleDamage}
            onToggleZone={toggleYourDamage}
            label={L('YOUR VEHICLE', 'TU VEHÍCULO', language)}
            language={language as 'en' | 'es'}
          />
        </div>
        {yourVehicleDamage.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {yourVehicleDamage.map(z => (
              <span key={z} className="text-xs bg-coral-400/20 text-coral-400 border border-coral-400/30 rounded px-2 py-0.5">
                {z.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ───────────────────────────────────────────────────────────────
  // STEP 5: OTHER VEHICLE DETAILS
  // ───────────────────────────────────────────────────────────────

  const renderStep5 = () => (
    <div className="space-y-5">
      {sectionHeader(4, 'OTHER VEHICLE DETAILS', 'DETALLES DEL OTRO VEHÍCULO')}

      {/* Warning header */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
        <p className="text-sm font-bold text-red-300">
          {L(
            '*** OTHER VEHICLE is the vehicle that struck you. The vehicle AT FAULT for accident. ***',
            '*** OTRO VEHÍCULO es el vehículo que lo golpeó. El vehículo CULPABLE del accidente. ***',
            language
          )}
        </p>
      </div>

      {renderVehicleForm(otherVehicle, setOtherVehicle, 'other')}

      {/* Car Diagram */}
      <div className="mt-6">
        <label className={`${labelCls} mb-3`}>
          {L('Mark the damaged areas on OTHER VEHICLE', 'Marque las áreas dañadas en OTRO VEHÍCULO', language)}
        </label>
        <div className="bg-navy rounded-xl border border-white/10 p-4">
          <CarDiagram
            selectedZones={otherVehicleDamage}
            onToggleZone={toggleOtherDamage}
            label={L('OTHER VEHICLE', 'OTRO VEHÍCULO', language)}
            language={language as 'en' | 'es'}
          />
        </div>
        {otherVehicleDamage.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {otherVehicleDamage.map(z => (
              <span key={z} className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded px-2 py-0.5">
                {z.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ───────────────────────────────────────────────────────────────
  // STEP 6: REVIEW & SUBMIT
  // ───────────────────────────────────────────────────────────────

  const caseNumber = useMemo(() => Math.floor(100000 + Math.random() * 900000).toString(), [])
  const caseManager = useMemo(() => {
    const cms = mockUsers.filter(u => u.role === 'case_manager')
    return cms.length > 0 ? cms.reduce((a, b) => a.xp_points <= b.xp_points ? a : b) : mockUsers[0]
  }, [])

  const reviewField = (label: string, value: string) => (
    <div>
      <p className="text-white/50 text-xs">{label}</p>
      <p className="text-white text-sm font-medium">{value || 'N/A'}</p>
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">Felicetti Law Firm</h2>
        <p className="text-purple-400 text-sm font-semibold mt-1">{L('Case Intake — Motor Vehicle', 'Admisión de Caso — Vehículo Motor', language)}</p>
        <p className="text-white/50 text-xs mt-1">{L('Case #', 'Caso #', language)} {caseNumber} &mdash; {L('Assigned to', 'Asignado a', language)}: {caseManager.full_name}</p>
      </div>

      {/* Flags */}
      {(isMinor || missingInsurance || noPoliceReport) && (
        <div className="space-y-2">
          {isMinor && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-300 font-semibold">{L('MINOR DETECTED — Attorney Escalation Required', 'MENOR DETECTADO — Escalación al Abogado Requerida', language)}</span>
            </div>
          )}
          {missingInsurance && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-orange-300">{L('Missing insurance information — will require follow-up', 'Falta información de seguro — se requerirá seguimiento', language)}</span>
            </div>
          )}
          {noPoliceReport && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-amber-300">{L('No police report — flagged for follow-up within 7 days', 'Sin reporte policial — marcado para seguimiento en 7 días', language)}</span>
            </div>
          )}
        </div>
      )}

      {/* Section 1 Summary: Your Information */}
      <div className="bg-navy rounded-xl border border-coral-400/30 overflow-hidden">
        <div className="bg-coral-400/10 px-4 py-2 border-b border-coral-400/20">
          <h3 className="text-sm font-bold text-coral-400">{L('YOUR INFORMATION', 'TU INFORMACIÓN', language)}</h3>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {reviewField(L('Full Name', 'Nombre', language), personal.fullName)}
          {reviewField(L('Phone', 'Teléfono', language), personal.phone)}
          {reviewField(L('Email', 'Correo', language), personal.email)}
          {reviewField(L('DOB', 'Fecha Nac.', language), personal.dob)}
          {reviewField(L('Address', 'Dirección', language), personal.currentAddress)}
          {reviewField(L('Marital Status', 'Estado Civil', language), personal.maritalStatus)}
          {reviewField(L('Country of Birth', 'País', language), personal.countryOfBirth)}
          {reviewField(L('Role in Accident', 'Rol en Accidente', language), personal.roleInAccident)}
          {reviewField(L('Passengers', 'Pasajeros', language), personal.passengers)}
        </div>
      </div>

      {/* Section 2 Summary: Accident Information */}
      <div className="bg-navy rounded-xl border border-blue-500/30 overflow-hidden">
        <div className="bg-blue-500/10 px-4 py-2 border-b border-blue-500/20">
          <h3 className="text-sm font-bold text-blue-400">{L('ACCIDENT INFORMATION', 'INFORMACIÓN DEL ACCIDENTE', language)}</h3>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {reviewField(L('Date', 'Fecha', language), accident.dateOfAccident)}
          {reviewField(L('Time', 'Hora', language), accident.timeOfAccident)}
          {reviewField(L('Location', 'Ubicación', language), `${accident.streetName}${accident.townOrCity ? ', ' + accident.townOrCity : ''}`)}
          {reviewField(L('State', 'Estado', language), accident.state)}
          {reviewField(L('Police Called', 'Policía Llamada', language), accident.policeCalled)}
          {reviewField(L('Police Case #', 'Caso Policial #', language), accident.policeCaseNumber)}
          {reviewField(L('Impact', 'Impacto', language), accident.impactLevel)}
        </div>
        <div className="px-4 pb-4">
          <p className="text-white/50 text-xs">{L('Description', 'Descripción', language)}</p>
          <p className="text-white text-sm mt-1">{accident.accidentDescription || 'N/A'}</p>
        </div>
      </div>

      {/* Section 3 Summary: Injury Details */}
      <div className="bg-navy rounded-xl border border-red-500/30 overflow-hidden">
        <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/20">
          <h3 className="text-sm font-bold text-red-400">{L('INJURY DETAILS', 'DETALLES DE LESIONES', language)}</h3>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {reviewField(L('Medicare/Medicaid', 'Medicare/Medicaid', language), injury.medicareEligible)}
          {reviewField(L('Ambulance', 'Ambulancia', language), injury.ambulanceCame)}
          {reviewField(L('Transported to Hospital', 'Transportado al Hospital', language), injury.ambulanceTransported)}
          {injury.hospitalName && reviewField(L('Hospital', 'Hospital', language), injury.hospitalName)}
        </div>
        <div className="px-4 pb-2">
          <p className="text-white/50 text-xs">{L('Injury Description', 'Descripción de Lesiones', language)}</p>
          <p className="text-white text-sm mt-1">{injury.injuryDescription || 'N/A'}</p>
        </div>
        {injuredBodyParts.length > 0 && (
          <div className="px-4 pb-4">
            <p className="text-white/50 text-xs mb-2">{L('Body Diagram', 'Diagrama Corporal', language)}</p>
            <div className="bg-navy-50 rounded-lg border border-white/5 p-3">
              <BodyDiagram selectedParts={injuredBodyParts} onTogglePart={() => {}} readonly language={language as 'en' | 'es'} />
            </div>
          </div>
        )}
      </div>

      {/* Section 4 Summary: Your Vehicle */}
      <div className="bg-navy rounded-xl border border-coral-400/30 overflow-hidden">
        <div className="bg-coral-400/10 px-4 py-2 border-b border-coral-400/20">
          <h3 className="text-sm font-bold text-coral-400">{L('YOUR VEHICLE', 'TU VEHÍCULO', language)}</h3>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {reviewField(L('Type', 'Tipo', language), yourVehicle.vehicleType)}
          {reviewField(L('Year/Make/Model', 'Año/Marca/Modelo', language), `${yourVehicle.year} ${yourVehicle.make} ${yourVehicle.model}`.trim())}
          {reviewField(L('Plate', 'Placa', language), yourVehicle.plateAndState)}
          {reviewField(L('Insured', 'Asegurado', language), yourVehicle.isInsured)}
          {reviewField(L('Insurance Co.', 'Compañía', language), yourVehicle.insuranceCompany)}
          {reviewField(L('Damage', 'Daño', language), yourVehicle.damageLevel)}
          {reviewField(L('Towed', 'Remolcado', language), yourVehicle.wasTowed)}
        </div>
        {yourVehicleDamage.length > 0 && (
          <div className="px-4 pb-4">
            <div className="bg-navy-50 rounded-lg border border-white/5 p-3">
              <CarDiagram selectedZones={yourVehicleDamage} onToggleZone={() => {}} label={L('YOUR VEHICLE', 'TU VEHÍCULO', language)} readonly language={language as 'en' | 'es'} />
            </div>
          </div>
        )}
      </div>

      {/* Section 5 Summary: Other Vehicle */}
      <div className="bg-navy rounded-xl border border-blue-500/30 overflow-hidden">
        <div className="bg-blue-500/10 px-4 py-2 border-b border-blue-500/20">
          <h3 className="text-sm font-bold text-blue-400">{L('OTHER VEHICLE', 'OTRO VEHÍCULO', language)}</h3>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {reviewField(L('Type', 'Tipo', language), otherVehicle.vehicleType)}
          {reviewField(L('Year/Make/Model', 'Año/Marca/Modelo', language), `${otherVehicle.year} ${otherVehicle.make} ${otherVehicle.model}`.trim())}
          {reviewField(L('Operator', 'Operador', language), otherVehicle.operator)}
          {reviewField(L('Owner', 'Propietario', language), otherVehicle.owner)}
          {reviewField(L('Plate / VIN', 'Placa / VIN', language), otherVehicle.plateAndState)}
          {reviewField(L('Insured', 'Asegurado', language), otherVehicle.isInsured)}
          {reviewField(L('Insurance Co.', 'Compañía', language), otherVehicle.insuranceCompany)}
          {reviewField(L('Damage', 'Daño', language), otherVehicle.damageLevel)}
          {reviewField(L('Towed', 'Remolcado', language), otherVehicle.wasTowed)}
        </div>
        {otherVehicleDamage.length > 0 && (
          <div className="px-4 pb-4">
            <div className="bg-navy-50 rounded-lg border border-white/5 p-3">
              <CarDiagram selectedZones={otherVehicleDamage} onToggleZone={() => {}} label={L('OTHER VEHICLE', 'OTRO VEHÍCULO', language)} readonly language={language as 'en' | 'es'} />
            </div>
          </div>
        )}
      </div>

      {/* Administrative fields */}
      <div className="bg-navy-50 rounded-xl border border-purple-400/20 p-5 space-y-4">
        <h3 className="text-sm font-bold text-purple-400 uppercase">{L('Administrative', 'Administrativo', language)}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>{L('Referral Code', 'Código de Referencia', language)}</label>
            <input type="text" name="referralCode" value={review.referralCode} onChange={up(setReview)} className={inputCls()} />
          </div>
          <div>
            <label className={labelCls}>{L('Prepared By', 'Preparado Por', language)}</label>
            <input type="text" name="preparedBy" value={review.preparedBy} onChange={up(setReview)} className={inputCls()} />
          </div>
          <div>
            <label className={labelCls}>{L('Date', 'Fecha', language)}</label>
            <input type="date" value={todayStr()} readOnly className={`${inputCls()} opacity-70 cursor-not-allowed`} />
          </div>
        </div>
      </div>
    </div>
  )

  // ───────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ───────────────────────────────────────────────────────────────

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6]

  return (
    <div className="min-h-screen bg-navy pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-50 to-navy-200 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {L('Felicetti Law Firm — Case Intake', 'Felicetti Law Firm — Admisión de Caso', language)}
            </h1>
            <p className="text-white/50 text-sm mt-0.5">{L('Motor Vehicle Accident', 'Accidente de Vehículo Motor', language)}</p>
          </div>
          <div className="hidden md:block">
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Mobile language toggle */}
        <div className="md:hidden mb-4">
          <LanguageToggle />
        </div>

        {renderStepIndicator()}

        {/* Form Card */}
        <div className="bg-gradient-to-br from-navy-50 to-navy-200 rounded-2xl border border-purple-400/20 p-5 md:p-8 shadow-xl">
          <form onSubmit={handleSubmit}>
            {/* Step content with transitions */}
            <div
              className="transition-all duration-200 ease-in-out"
              style={{
                opacity: transitioning ? 0 : 1,
                transform: transitioning ? 'translateY(12px)' : 'translateY(0)',
              }}
            >
              {stepRenderers[currentStep - 1]()}
            </div>

            {/* Validation error message */}
            {validationErrors.size > 0 && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-300">
                  {L('Please fill in all required fields before continuing.', 'Por favor complete todos los campos requeridos antes de continuar.', language)}
                </span>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
                  currentStep === 1 ? 'opacity-30 cursor-not-allowed text-white/50' : 'text-white hover:bg-white/10'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                {L('Back', 'Atrás', language)}
              </button>

              {currentStep === 6 ? (
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-2.5 bg-teal-400 hover:bg-teal-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-teal-400/20"
                >
                  <Sparkles className="w-5 h-5" />
                  {L('Submit Case', 'Enviar Caso', language)}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-400 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-400/20"
                >
                  {L('Next', 'Siguiente', language)}
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default IntakePage

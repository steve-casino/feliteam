'use client'

import React, { useState, useEffect } from 'react'
import { createCase } from './actions'
import {
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  AlertCircle,
  Zap,
  Sparkles
} from 'lucide-react'

// US States list
const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY'
]

interface FormData {
  clientName: string
  phone: string
  dob: string
  dateOfAccident: string
  state: string
  zipCode: string
  accidentDescription: string
  opposingParty: string
  policeReportNumber: string
  umPolicy: string
  biInfo: string
}

interface Flags {
  isMinor: boolean
  missingInsurance: boolean
  noPoliceReport: boolean
}

const IntakePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    phone: '',
    dob: '',
    dateOfAccident: '',
    state: '',
    zipCode: '',
    accidentDescription: '',
    opposingParty: '',
    policeReportNumber: '',
    umPolicy: '',
    biInfo: ''
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [generatedCaseNumber, setGeneratedCaseNumber] = useState('')
  const [assignedCaseManagerName, setAssignedCaseManagerName] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [flags, setFlags] = useState<Flags>({
    isMinor: false,
    missingInsurance: false,
    noPoliceReport: false
  })

  // Calculate age and check if minor
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      const isMinor = age < 18 || (age === 18 && monthDiff < 0)
      setFlags((prev) => ({ ...prev, isMinor }))
    }
  }, [formData.dob])

  // Check for missing insurance
  useEffect(() => {
    const missingBoth = !formData.umPolicy && !formData.biInfo
    setFlags((prev) => ({ ...prev, missingInsurance: missingBoth }))
  }, [formData.umPolicy, formData.biInfo])

  // Check for police report
  useEffect(() => {
    const noReport = !formData.policeReportNumber
    setFlags((prev) => ({ ...prev, noPoliceReport: noReport }))
  }, [formData.policeReportNumber])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)
    const result = await createCase({
      clientName: formData.clientName,
      phone: formData.phone,
      dob: formData.dob,
      dateOfAccident: formData.dateOfAccident,
      state: formData.state,
      zipCode: formData.zipCode,
      accidentDescription: formData.accidentDescription,
      opposingParty: formData.opposingParty,
      policeReportNumber: formData.policeReportNumber,
      umPolicy: formData.umPolicy,
      biInfo: formData.biInfo,
    })
    setSubmitting(false)
    if (!result.ok) {
      setSubmitError(result.error ?? 'Something went wrong')
      return
    }
    setGeneratedCaseNumber(result.caseNumber ?? '')
    setAssignedCaseManagerName(result.caseManagerName ?? null)
    setShowSuccess(true)
  }

  const getStepIndicatorColor = (step: number) => {
    if (step < currentStep) return 'bg-teal-400'
    if (step === currentStep) return 'bg-purple-400'
    return 'bg-navy-200'
  }

  const getStepIndicatorTextColor = (step: number) => {
    if (step === currentStep) return 'text-white'
    if (step < currentStep) return 'text-white'
    return 'text-white/50'
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {/* Confetti-like particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `bounce ${2 + Math.random() * 1}s infinite`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
            ))}
          </div>

          {/* Success Card */}
          <div className="relative z-10 bg-gradient-to-br from-navy-50 to-navy-200 rounded-2xl border border-purple-400/30 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-teal-400 rounded-full p-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              Success!
            </h2>
            <p className="text-white/70 mb-6">Case created successfully!</p>

            <div className="space-y-4 mb-8">
              <div className="bg-navy rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-1">
                  Case Number
                </p>
                <p className="text-2xl font-bold text-purple-400">
                  {generatedCaseNumber}
                </p>
              </div>

              {assignedCaseManagerName && (
                <div className="bg-navy rounded-lg p-4 border border-white/10">
                  <p className="text-white/60 text-sm mb-1">
                    Assigned Case Manager
                  </p>
                  <p className="text-lg font-semibold text-teal-400">
                    {assignedCaseManagerName}
                  </p>
                </div>
              )}

              {/* Flags Summary */}
              <div className="space-y-2 text-left">
                {flags.isMinor && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-300">
                      Minor Detected - Attorney Escalation Required
                    </span>
                  </div>
                )}
                {flags.missingInsurance && (
                  <div className="bg-coral-400/10 border border-coral-400/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-coral-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-coral-400/90">
                      Missing insurance info - will be flagged
                    </span>
                  </div>
                )}
                {flags.noPoliceReport && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-yellow-300">
                      If unavailable, case will be flagged for follow-up
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setShowSuccess(false)
                setCurrentStep(1)
                setFormData({
                  clientName: '',
                  phone: '',
                  dob: '',
                  dateOfAccident: '',
                  state: '',
                  zipCode: '',
                  accidentDescription: '',
                  opposingParty: '',
                  policeReportNumber: '',
                  umPolicy: '',
                  biInfo: ''
                })
              }}
              className="w-full bg-purple-400 hover:bg-purple-500 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Create Another Case
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-50 to-navy-200 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">New Case Intake</h1>
            <p className="text-white/60 mt-1">Create a new case by entering client and accident details</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${getStepIndicatorColor(
                    step
                  )} ${getStepIndicatorTextColor(step)}`}
                >
                  {step < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>

                {/* Connecting Line */}
                {index < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all ${
                      step < currentStep
                        ? 'bg-teal-400'
                        : 'bg-navy-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-xs font-medium text-white/70">
                Client Information
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-white/70">
                Accident Details
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-white/70">
                Insurance Information
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-white/70">
                Review &amp; Submit
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-navy-50 to-navy-200 rounded-2xl border border-purple-400/20 p-8 shadow-xl">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Client Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-purple-400/20 flex items-center justify-center text-purple-400">
                    1
                  </span>
                  Client Information
                </h2>

                <div className="flex flex-col gap-4">
                  {/* Client Name */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Client Full Name
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                      className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Phone Number
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="(512) 555-0100"
                      className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Date of Birth
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none transition-colors"
                    />
                    {flags.isMinor && (
                      <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-300">
                          Minor Detected - Attorney Escalation Required
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Accident Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-purple-400/20 flex items-center justify-center text-purple-400">
                    2
                  </span>
                  Accident Details
                </h2>

                <div className="space-y-4">
                  {/* Date of Accident */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Date of Accident
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfAccident"
                      value={formData.dateOfAccident}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      State
                      <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-400 focus:outline-none transition-colors"
                    >
                      <option value="">
                        Select a state
                      </option>
                      {US_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>

                    {/* TX Info Box */}
                    {formData.state === 'TX' && (
                      <div className="mt-3 bg-teal-400/10 border border-teal-400/30 rounded-lg p-3 flex items-start gap-2">
                        <Zap className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-teal-300">
                          TX Default Limits: BI $30,000 | PD $25,000
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Zip Code
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      placeholder="78701"
                      className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Accident Description */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Accident Description
                      <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="accidentDescription"
                      value={formData.accidentDescription}
                      onChange={handleInputChange}
                      required
                      placeholder="Describe what happened..."
                      rows={4}
                      className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Opposing Party */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Opposing Party
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="opposingParty"
                      value={formData.opposingParty}
                      onChange={handleInputChange}
                      required
                      placeholder="ABC Company"
                      className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Police Report Number */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Police Report Number
                      <span className="text-gray-400 text-xs ml-1">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="policeReportNumber"
                      value={formData.policeReportNumber}
                      onChange={handleInputChange}
                      placeholder="APD-2024-451802"
                      className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none transition-colors"
                    />
                    {!formData.policeReportNumber && (
                      <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-yellow-300">
                          If unavailable, case will be flagged for follow-up
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Insurance Information */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-purple-400/20 flex items-center justify-center text-purple-400">
                    3
                  </span>
                  Insurance Information
                </h2>

                <div className="space-y-4">
                  {/* UM Policy Number */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      UM Policy Number
                      <span className="text-gray-400 text-xs ml-1">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="umPolicy"
                      value={formData.umPolicy}
                      onChange={handleInputChange}
                      placeholder="$50,000"
                      className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* BI Information */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      BI Information
                      <span className="text-gray-400 text-xs ml-1">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="biInfo"
                      value={formData.biInfo}
                      onChange={handleInputChange}
                      placeholder="$30,000/$60,000"
                      className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:border-purple-400 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Insurance Warning */}
                  {flags.missingInsurance && (
                    <div className="bg-coral-400/10 border border-coral-400/30 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-coral-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-coral-400 mb-1">
                          Missing Insurance Information
                        </p>
                        <p className="text-sm text-coral-300">
                          Missing insurance info - will be flagged
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-purple-400/10 border border-purple-400/30 rounded-lg p-4">
                    <p className="text-sm text-white/80">
                      Both UM and BI information are optional but recommended. If not provided, we will flag the case for follow-up.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-purple-400/20 flex items-center justify-center text-purple-400">
                    4
                  </span>
                  Review &amp; Submit
                </h2>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client Info Summary */}
                  <div className="bg-navy rounded-lg p-4 border border-white/10">
                    <h3 className="text-sm font-semibold text-purple-400 mb-3">
                      Client Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-white/60">
                          Client Full Name
                        </p>
                        <p className="text-white font-medium">
                          {formData.clientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60">Phone Number</p>
                        <p className="text-white font-medium">
                          {formData.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60">Date of Birth</p>
                        <p className="text-white font-medium">
                          {formData.dob}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Accident Info Summary */}
                  <div className="bg-navy rounded-lg p-4 border border-white/10">
                    <h3 className="text-sm font-semibold text-teal-400 mb-3">
                      Accident Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-white/60">
                          Date of Accident
                        </p>
                        <p className="text-white font-medium">
                          {formData.dateOfAccident}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60">
                          State
                        </p>
                        <p className="text-white font-medium">
                          {formData.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60">
                          Zip Code
                        </p>
                        <p className="text-white font-medium">
                          {formData.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Insurance Info Summary */}
                  <div className="bg-navy rounded-lg p-4 border border-white/10">
                    <h3 className="text-sm font-semibold text-coral-400 mb-3">
                      Insurance Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-white/60">
                          UM Policy Number
                        </p>
                        <p className="text-white font-medium">
                          {formData.umPolicy || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60">
                          BI Information
                        </p>
                        <p className="text-white font-medium">
                          {formData.biInfo || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description Summary */}
                  <div className="bg-navy rounded-lg p-4 border border-white/10 md:col-span-2">
                    <h3 className="text-sm font-semibold text-purple-400 mb-3">
                      Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-white/60">
                          Accident Description
                        </p>
                        <p className="text-white mt-1 line-clamp-2">
                          {formData.accidentDescription}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-white/60">
                          Opposing Party
                        </p>
                        <p className="text-white font-medium">
                          {formData.opposingParty}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-white/60">
                          Police Report Number
                        </p>
                        <p className="text-white font-medium">
                          {formData.policeReportNumber || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flags Section */}
                {(flags.isMinor || flags.missingInsurance || flags.noPoliceReport) && (
                  <div className="bg-navy-200 rounded-lg p-4 border border-white/10">
                    <h3 className="text-sm font-semibold text-white mb-3">
                      Case Flags
                    </h3>
                    <div className="space-y-2">
                      {flags.isMinor && (
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-300">
                            Minor Detected - Attorney Escalation Required
                          </span>
                        </div>
                      )}
                      {flags.missingInsurance && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-coral-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-coral-300">
                            Missing insurance info - will be flagged
                          </span>
                        </div>
                      )}
                      {flags.noPoliceReport && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-yellow-300">
                            If unavailable, case will be flagged for follow-up
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
                  currentStep === 1
                    ? 'opacity-50 cursor-not-allowed text-white/50'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              {currentStep === 4 ? (
                <div className="flex flex-col items-end gap-2">
                  {submitError && (
                    <span className="text-sm text-red-400">{submitError}</span>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-2 bg-teal-400 hover:bg-teal-500 disabled:bg-teal-400/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    {submitting ? 'Submitting...' : 'Create Case'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-400 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all"
                >
                  Next
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

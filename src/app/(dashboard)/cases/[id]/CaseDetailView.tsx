'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Case, CaseNote, CaseStage, User } from '@/types'
import { addNote, changeStage, toggleUrgent } from './actions'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StagePill from '@/components/ui/StagePill'
import Avatar from '@/components/ui/Avatar'
import { TREATMENT_GAP_DAYS, POLICE_REPORT_FLAG_DAYS, CASE_STAGES } from '@/lib/constants'
import {
  ArrowLeft,
  Phone,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Flag,
  ChevronDown,
  Plus,
  Zap
} from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'

type NoteTab = 'notes' | 'call_log' | 'treatment_log'

interface CaseDetailProps {
  caseObj: Case | null
  caseNotes: CaseNote[]
  users: User[]
}

const CaseDetailPage: React.FC<CaseDetailProps> = ({
  caseObj,
  caseNotes,
  users: mockUsers,
}) => {
  const router = useRouter()
  const caseId = caseObj?.id ?? ''

  // State
  const [activeNoteTab, setActiveNoteTab] = useState<NoteTab>('notes')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [isStageChangeOpen, setIsStageChangeOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<CaseStage>(caseObj?.stage || 'new_case')
  const [isUrgent, setIsUrgentState] = useState(caseObj?.is_urgent || false)
  const [, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

  const setIsUrgent = (next: boolean) => {
    setIsUrgentState(next)
    startTransition(async () => {
      const result = await toggleUrgent(caseId, next)
      if (!result.ok) setActionError(result.error ?? 'Failed')
    })
  }

  if (!caseObj) {
    return (
      <div className="space-y-6">
        <Link href="/cases">
          <Button variant="ghost" size="md" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Cases
          </Button>
        </Link>
        <Card className="text-center py-12">
          <p className="text-white/60">Case not found</p>
        </Card>
      </div>
    )
  }

  const caseManager = mockUsers.find((u) => u.id === caseObj.assigned_case_manager_id)
  const medicalManager = mockUsers.find((u) => u.id === caseObj.assigned_medical_manager_id)

  // Helper: Check if treatment gap exists
  const hasTreatmentGap = (): boolean => {
    if (caseObj.treatment_status !== 'in_progress') return false
    const now = new Date()
    const lastUpdateDate = parseISO(caseObj.updated_at)
    const daysSince = Math.floor(
      (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSince > TREATMENT_GAP_DAYS
  }

  // Helper: Days since last treatment
  const daysSinceTreatment = (): number => {
    const now = new Date()
    const lastUpdateDate = parseISO(caseObj.updated_at)
    return Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Helper: Days until police report deadline
  const daysUntilPoliceReportDeadline = (): number => {
    const accidentDate = parseISO(caseObj.date_of_accident)
    const deadline = new Date(accidentDate)
    deadline.setDate(deadline.getDate() + POLICE_REPORT_FLAG_DAYS)
    const now = new Date()
    return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Helper: Vehicle impound days remaining
  const impoundDaysRemaining = (): number | null => {
    if (!caseObj.vehicle_impound_date) return null
    const impoundDate = parseISO(caseObj.vehicle_impound_date)
    const deadline = new Date(impoundDate)
    deadline.setDate(deadline.getDate() + 30)
    const now = new Date()
    const remaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return remaining > 0 ? remaining : null
  }

  // Helper: Check TRT readiness
  const isTRTReady = (): boolean => {
    return caseObj.demographics_sent && caseObj.lor_sent && caseObj.first_treatment_confirmed
  }

  // Handle note submission
  const handleAddNote = () => {
    const content = newNoteContent.trim()
    if (!content) return
    const type = activeNoteTab === 'notes' ? 'note' : activeNoteTab
    startTransition(async () => {
      const result = await addNote(caseId, content, type)
      if (!result.ok) {
        setActionError(result.error ?? 'Failed to add note')
        return
      }
      setNewNoteContent('')
      setIsAddNoteOpen(false)
      router.refresh()
    })
  }

  const handleStageUpdate = () => {
    startTransition(async () => {
      const result = await changeStage(caseId, selectedStage)
      if (!result.ok) {
        setActionError(result.error ?? 'Failed to change stage')
        return
      }
      setIsStageChangeOpen(false)
      router.refresh()
    })
  }

  // Filtered notes by tab
  const filteredNotes = activeNoteTab === 'notes'
    ? caseNotes.filter((n) => n.type === 'note')
    : caseNotes.filter((n) => n.type === activeNoteTab)

  // Sort notes by newest first
  const sortedNotes = [...filteredNotes].sort(
    (a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
  )

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/cases">
            <Button variant="ghost" size="md" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{caseObj.case_number}</h1>
              {caseObj.is_urgent && (
                <Flag className="w-6 h-6 text-coral-400 fill-coral-400" />
              )}
            </div>
            <p className="text-lg text-white/80">{caseObj.client_name}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <StagePill stage={caseObj.stage} className="inline-block" />
          <Button
            variant={isUrgent ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => setIsUrgent(!isUrgent)}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            {isUrgent ? 'Mark Not Urgent' : 'Mark Urgent'}
          </Button>
        </div>
      </div>

      {/* Stage Change Modal */}
      <Modal
        isOpen={isStageChangeOpen}
        onClose={() => setIsStageChangeOpen(false)}
        title="Change Case Stage"
      >
        <div className="space-y-4">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as CaseStage)}
            className="w-full px-4 py-2.5 bg-navy-50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            {CASE_STAGES.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
          {actionError && (
            <p className="text-sm text-red-400">{actionError}</p>
          )}
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleStageUpdate}>
              Update Stage
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsStageChangeOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Client Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Client Info */}
        <Card header={<h3 className="font-semibold text-white">Client Information</h3>}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Full Name</p>
              <p className="text-white font-medium">{caseObj.client_name}</p>
            </div>

            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Phone</p>
              <a
                href={`tel:${caseObj.client_phone}`}
                className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {caseObj.client_phone}
              </a>
            </div>

            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Date of Birth</p>
              <p className="text-white">
                {new Date(caseObj.client_dob).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wide">State</p>
                <p className="text-white font-medium">{caseObj.state}</p>
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wide">Zip</p>
                <p className="text-white font-medium">{caseObj.zip_code}</p>
              </div>
            </div>

            {caseObj.is_minor && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
                <span className="text-sm text-red-200 font-medium">Minor Client</span>
              </div>
            )}
          </div>
        </Card>

        {/* Column 2: Accident & Insurance */}
        <Card header={<h3 className="font-semibold text-white">Accident & Insurance</h3>}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Date of Accident</p>
              <p className="text-white font-medium">
                {new Date(caseObj.date_of_accident).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Description</p>
              <p className="text-white/80 text-sm leading-relaxed">
                {caseObj.accident_description}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">UM Policy</p>
              <p className="text-purple-300 font-semibold">{caseObj.insurance_um_policy}</p>
            </div>

            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">BI Info</p>
              <p className="text-purple-300 font-semibold">{caseObj.insurance_bi_info}</p>
            </div>

            {caseObj.has_insurance_warning && (
              <div className="p-3 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-300 flex-shrink-0" />
                <span className="text-sm text-orange-200 font-medium">No Insurance</span>
              </div>
            )}

            {caseObj.state === 'TX' && (
              <div className="p-3 rounded-lg bg-teal-500/20 border border-teal-500/30">
                <p className="text-xs text-teal-300 font-semibold">Texas Limits</p>
                <p className="text-teal-200 text-sm mt-1">
                  BI: $30,000 | PD: $25,000
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Opposing Party</p>
              <p className="text-white/80">{caseObj.opposing_party}</p>
            </div>
          </div>
        </Card>

        {/* Column 3: Case Status */}
        <Card header={<h3 className="font-semibold text-white">Case Status</h3>}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Case Manager</p>
              {caseManager ? (
                <div className="flex items-center gap-2 mt-1">
                  <Avatar name={caseManager.full_name} size="sm" />
                  <span className="text-white">{caseManager.full_name}</span>
                </div>
              ) : (
                <p className="text-white/60 mt-1">Unassigned</p>
              )}
            </div>

            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Medical Manager</p>
              {medicalManager ? (
                <div className="flex items-center gap-2 mt-1">
                  <Avatar name={medicalManager.full_name} size="sm" />
                  <span className="text-white">{medicalManager.full_name}</span>
                </div>
              ) : (
                <p className="text-white/60 mt-1">Not Assigned</p>
              )}
            </div>

            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Police Report</p>
              <div className="flex items-center gap-2 mt-1">
                {caseObj.police_report_number ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                ) : caseObj.police_report_status === 'not_needed' ? (
                  <Clock className="w-4 h-4 text-white/50 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                <span className="text-white text-sm">
                  {caseObj.police_report_number || 'Pending'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">BI LOR Status</p>
              <p className="text-purple-300 capitalize font-medium mt-1">
                {caseObj.bi_lor_status}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">UM/PIP LOR Status</p>
              <p className="text-purple-300 capitalize font-medium mt-1">
                {caseObj.um_pip_lor_status}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/60 uppercase tracking-wide">Treatment Status</p>
              <p className="text-teal-300 capitalize font-medium mt-1">
                {caseObj.treatment_status.replace('_', ' ')}
              </p>
            </div>

            {caseObj.clinic_info && (
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wide">Clinic</p>
                <p className="text-white/80 text-sm mt-1">{caseObj.clinic_info}</p>
              </div>
            )}

            {impoundDaysRemaining() && (
              <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
                <p className="text-xs text-amber-300 font-semibold">Vehicle Impound</p>
                <p className="text-amber-200 text-sm mt-1">
                  {impoundDaysRemaining()} days remaining (out of 30)
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* TRT Requirements & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TRT Readiness */}
        <Card
          variant={isTRTReady() ? 'highlighted' : 'default'}
          header={<h3 className="font-semibold text-white">TRT Requirements</h3>}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {caseObj.demographics_sent ? (
                <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-white/40 flex-shrink-0" />
              )}
              <span className={caseObj.demographics_sent ? 'text-white' : 'text-white/60'}>
                Demographics Sent
              </span>
            </div>

            <div className="flex items-center gap-3">
              {caseObj.lor_sent ? (
                <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-white/40 flex-shrink-0" />
              )}
              <span className={caseObj.lor_sent ? 'text-white' : 'text-white/60'}>
                LOR Sent
              </span>
            </div>

            <div className="flex items-center gap-3">
              {caseObj.first_treatment_confirmed ? (
                <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-white/40 flex-shrink-0" />
              )}
              <span className={caseObj.first_treatment_confirmed ? 'text-white' : 'text-white/60'}>
                First Treatment Confirmed
              </span>
            </div>

            {isTRTReady() && (
              <div className="mt-4 p-3 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-300 flex-shrink-0" />
                <span className="text-sm text-teal-200 font-semibold">Ready for TRT</span>
              </div>
            )}
          </div>
        </Card>

        {/* Alerts */}
        <Card header={<h3 className="font-semibold text-white">Alerts & Notifications</h3>}>
          <div className="space-y-3">
            {hasTreatmentGap() && (
              <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/30 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-200 font-semibold">Treatment Gap</p>
                  <p className="text-amber-200/80 text-xs mt-0.5">
                    {daysSinceTreatment()} days since last update
                  </p>
                </div>
              </div>
            )}

            {caseObj.police_report_status === 'pending' && daysUntilPoliceReportDeadline() <= 7 && (
              <div className="p-3 rounded-lg bg-coral-500/20 border border-coral-500/30 flex gap-3">
                <AlertCircle className="w-5 h-5 text-coral-300 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-coral-200 font-semibold">Police Report Deadline</p>
                  <p className="text-coral-200/80 text-xs mt-0.5">
                    {daysUntilPoliceReportDeadline()} days until 7-day deadline
                  </p>
                </div>
              </div>
            )}

            {!hasTreatmentGap() && caseObj.police_report_status !== 'pending' && (
              <div className="p-3 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-300 flex-shrink-0" />
                <span className="text-sm text-teal-200 font-semibold">All Clear</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Case Notes Section */}
      <Card header={<h3 className="font-semibold text-white">Case Timeline</h3>}>
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10">
            {(['notes', 'call_log', 'treatment_log'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveNoteTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeNoteTab === tab
                    ? 'border-purple-400 text-purple-400'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {tab === 'notes'
                  ? 'Notes'
                  : tab === 'call_log'
                  ? 'Call Log'
                  : 'Treatment Log'}
              </button>
            ))}
          </div>

          {/* Add Note Button */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddNoteOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {activeNoteTab === 'notes' ? 'Note' : activeNoteTab === 'call_log' ? 'Call Log' : 'Treatment'}
            </Button>
          </div>

          {/* Add Note Modal */}
          <Modal
            isOpen={isAddNoteOpen}
            onClose={() => setIsAddNoteOpen(false)}
            title={`Add ${activeNoteTab === 'notes' ? 'Note' : activeNoteTab === 'call_log' ? 'Call Log' : 'Treatment Log'}`}
          >
            <div className="space-y-4">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter your note..."
                className="w-full px-4 py-3 bg-navy-50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 resize-none h-32"
              />
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim()}
                >
                  Save Note
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsAddNoteOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>

          {/* Notes List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedNotes.length > 0 ? (
              sortedNotes.map((note) => {
                const noteAuthor = mockUsers.find((u) => u.id === note.user_id)
                return (
                  <div key={note.id} className="p-4 rounded-lg bg-navy-200/30 border border-white/5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {noteAuthor && (
                          <Avatar name={noteAuthor.full_name} size="sm" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {noteAuthor?.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-white/50">
                            {formatDistanceToNow(parseISO(note.created_at), {
                              addSuffix: true
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-300">
                        {note.type === 'call_log'
                          ? 'Call'
                          : note.type === 'treatment_log'
                          ? 'Treatment'
                          : 'Note'}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                )
              })
            ) : (
              <p className="text-white/60 text-sm text-center py-6">
                No {activeNoteTab === 'notes' ? 'notes' : activeNoteTab === 'call_log' ? 'call logs' : 'treatment logs'} yet
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Action Bar - Sticky */}
      <div className="sticky bottom-0 bg-navy border-t border-white/10 p-4 rounded-t-xl space-y-3 sm:space-y-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="secondary" size="sm" className="gap-2 w-full">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Log Call</span>
            <span className="sm:hidden">Call</span>
          </Button>
          <Button variant="secondary" size="sm" className="gap-2 w-full">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Log Treatment</span>
            <span className="sm:hidden">Treatment</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsStageChangeOpen(true)}
            className="gap-2 w-full"
          >
            <ChevronDown className="w-4 h-4" />
            <span className="hidden sm:inline">Change Stage</span>
            <span className="sm:hidden">Stage</span>
          </Button>
          <Button variant="danger" size="sm" className="gap-2 w-full">
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">Mark Urgent</span>
            <span className="sm:hidden">Urgent</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CaseDetailPage

'use client'

import React, { useState, useMemo } from 'react'
import { format, differenceInDays, isBefore, isToday, startOfDay } from 'date-fns'
import { Phone, MessageSquare, ArrowRight, FileText, ChevronDown, Copy, Check } from 'lucide-react'
import Card from '@/components/ui/Card'
import ProgressBar from '@/components/ui/ProgressBar'
import XPDisplay from '@/components/ui/XPDisplay'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import OpportunitiesFeed from '@/components/dashboard/OpportunitiesFeed'
import { mockCases, mockUsers, mockChecklistItems } from '@/lib/mock-data'
import { useTranslation } from '@/hooks/useLanguage'

interface QuickActionModal {
  type: 'call' | 'text' | 'stage' | 'note' | null
  data?: any
}

const messageTemplates = [
  {
    id: 'insurance',
    title: 'Insurance Request',
    en: 'Hello, I am following up on your case #[CASE_NUMBER]. Could you please provide the insurance information for the accident on [DATE]? Thank you.',
    es: 'Hola, estoy dando seguimiento a su caso #[CASE_NUMBER]. ¿Podría proporcionar la información del seguro del accidente del [DATE]? Gracias.'
  },
  {
    id: 'appointment',
    title: 'Appointment Reminder',
    en: 'This is a reminder of your appointment on [DATE] at [TIME]. Please let me know if you need to reschedule.',
    es: 'Este es un recordatorio de su cita el [DATE] a las [TIME]. Avíseme si necesita reprogramar.'
  },
  {
    id: 'treatment',
    title: 'Treatment Importance',
    en: 'Continuing your medical treatment is crucial for your recovery. Please keep all appointments with your healthcare provider.',
    es: 'Continuar con su tratamiento médico es crucial para su recuperación. Por favor, mantenga todas sus citas con su proveedor de atención médica.'
  },
  {
    id: 'bi-vs-pd',
    title: 'BI vs PD Explanation',
    en: 'Your claim includes both Bodily Injury (BI) coverage for your medical treatment and Property Damage (PD) coverage for your vehicle.',
    es: 'Su reclamación incluye cobertura de Lesiones Corporales (BI) para su tratamiento médico y cobertura de Daño a Propiedad (PD) para su vehículo.'
  },
  {
    id: 'police-report',
    title: 'Police Report Follow-up',
    en: 'We are following up to obtain the official police report for your accident. This helps strengthen your claim.',
    es: 'Estamos dando seguimiento para obtener el informe oficial de policía de su accidente. Esto ayuda a fortalecer su reclamación.'
  }
]

const DashboardPage: React.FC = () => {
  const { t, language } = useTranslation()
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [modalData, setModalData] = useState<QuickActionModal>({ type: null })

  const currentUser = mockUsers[0]
  const userCases = mockCases.filter((c) => c.assigned_case_manager_id === currentUser.id)
  const userChecklistItems = mockChecklistItems.filter((item) => item.case_manager_id === currentUser.id)

  // Calculate stats
  const activeCount = userCases.filter((c) => c.stage !== 'srl').length
  const closedThisMonth = userCases.filter((c) => {
    const updated = new Date(c.updated_at)
    const now = new Date()
    return (
      c.stage === 'srl' &&
      updated.getMonth() === now.getMonth() &&
      updated.getFullYear() === now.getFullYear()
    )
  }).length
  const completedItems = userChecklistItems.filter((item) => item.completed).length
  const completionPercent = userChecklistItems.length > 0 ? (completedItems / userChecklistItems.length) * 100 : 0

  // Get follow-ups due today or soon
  const followUpsDue = userCases
    .filter((c) => {
      const today = new Date()
      const updated = new Date(c.updated_at)
      const daysSince = differenceInDays(today, updated)
      return daysSince >= 7 && daysSince <= 21
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  // Group checklist by category
  const checklistsByCategory = useMemo(() => {
    const grouped: Record<string, typeof userChecklistItems> = {}
    userChecklistItems.forEach((item) => {
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(item)
    })
    return grouped
  }, [userChecklistItems])

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      intake: '📋',
      documentation: '📄',
      liability: '⚖️',
      treatment: '💊',
      property_damage: '🚗',
      settlement: '💰',
      nursing: '🏥'
    }
    return icons[category] || '📝'
  }

  const handleCheckItem = (id: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedItems(newChecked)
  }

  const toggleTemplate = (id: string) => {
    const newExpanded = new Set(expandedTemplates)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedTemplates(newExpanded)
  }

  const copyTemplate = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedTemplate(id)
    setTimeout(() => setCopiedTemplate(null), 2000)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }

  const greeting = getGreeting()

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Good {greeting}, {currentUser.full_name.split(' ')[0]}!
          </h1>
          <p className="text-white/60">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="md:w-80">
          <XPDisplay xp={currentUser.xp_points} level={currentUser.level} />
        </div>
      </div>

      {/* Opportunities feed — submitted by Case Reps */}
      <OpportunitiesFeed />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="space-y-1">
            <p className="text-white/70 text-sm font-semibold">Active Cases</p>
            <p className="text-3xl font-bold text-blue-400">{activeCount}</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-1">
            <p className="text-white/70 text-sm font-semibold">Closed This Month</p>
            <p className="text-3xl font-bold text-teal-400">{closedThisMonth}</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-1">
            <p className="text-white/70 text-sm font-semibold">Checklist %</p>
            <p className="text-3xl font-bold text-coral-400">{Math.round(completionPercent)}%</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-1">
            <p className="text-white/70 text-sm font-semibold">Follow-ups Due</p>
            <p className="text-3xl font-bold text-blue-400">{followUpsDue.length}</p>
          </div>
        </Card>
      </div>

      {/* Daily Checklist Section */}
      <div className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-white">Daily Checklist</h2>
                <span className="text-sm text-white/60">{completedItems} of {userChecklistItems.length}</span>
              </div>
              <ProgressBar value={completionPercent} color="teal" size="md" />
            </div>

            {completionPercent > 80 && (
              <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3 text-center">
                <p className="text-teal-400 font-semibold">You're crushing it! 🔥</p>
              </div>
            )}

            {/* Checklist Items by Category */}
            <div className="space-y-6 mt-6">
              {Object.entries(checklistsByCategory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-bold text-white/70 mb-3 uppercase tracking-wide">
                    {getCategoryIcon(category)} {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const caseData = mockCases.find((c) => c.id === item.case_id)
                      const isChecked = checkedItems.has(item.id)
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isChecked
                              ? 'bg-white/5 border-white/10 opacity-60'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckItem(item.id)}
                            className="w-5 h-5 rounded cursor-pointer accent-teal-400"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${isChecked ? 'line-through text-white/40' : 'text-white'}`}>
                              {caseData?.case_number} - {caseData?.client_name}
                            </p>
                            <p className={`text-xs ${isChecked ? 'line-through text-white/30' : 'text-white/60'}`}>
                              {item.label}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setModalData({ type: 'call' })}
          className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/20 hover:border-blue-400/40 hover:bg-blue-500/15 transition-all group"
        >
          <Phone className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-white">Log Call</p>
        </button>

        <button
          onClick={() => setModalData({ type: 'text' })}
          className="p-4 rounded-lg bg-teal-400/10 border border-teal-400/20 hover:border-teal-400/40 hover:bg-teal-400/15 transition-all group"
        >
          <MessageSquare className="w-6 h-6 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-white">Send Text</p>
        </button>

        <button
          onClick={() => setModalData({ type: 'stage' })}
          className="p-4 rounded-lg bg-amber-400/10 border border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/15 transition-all group"
        >
          <ArrowRight className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-white">Update Stage</p>
        </button>

        <button
          onClick={() => setModalData({ type: 'note' })}
          className="p-4 rounded-lg bg-blue-400/10 border border-blue-400/20 hover:border-blue-400/40 hover:bg-blue-400/15 transition-all group"
        >
          <FileText className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-white">Add Note</p>
        </button>
      </div>

      {/* Upcoming Follow-ups */}
      <Card header={<h2 className="text-lg font-bold text-white">Upcoming Follow-ups</h2>}>
        <div className="space-y-2">
          {followUpsDue.length > 0 ? (
            followUpsDue.map((caseData) => {
              const daysSinceUpdate = differenceInDays(new Date(), new Date(caseData.updated_at))
              const isOverdue = daysSinceUpdate > 14
              const isDueToday = isToday(new Date(caseData.updated_at))

              return (
                <div
                  key={caseData.id}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    isOverdue
                      ? 'bg-coral-400/10 border-coral-400/30'
                      : isDueToday
                        ? 'bg-amber-400/10 border-amber-400/30'
                        : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{caseData.case_number}</p>
                    <p className="text-sm text-white/60">{caseData.client_name}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        isOverdue ? 'text-coral-400' : isDueToday ? 'text-amber-400' : 'text-white/70'
                      }`}
                    >
                      {isOverdue ? 'Overdue' : isDueToday ? 'Today' : `${daysSinceUpdate} days`}
                    </p>
                    <p className="text-xs text-white/50">{format(new Date(caseData.updated_at), 'MMM d')}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-white/60 text-center py-4">No upcoming follow-ups</p>
          )}
        </div>
      </Card>

      {/* Message Templates */}
      <Card>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity"
        >
          <h2 className="text-lg font-bold text-white">Message Templates</h2>
          <ChevronDown
            className={`w-5 h-5 text-white/60 transition-transform ${showTemplates ? 'rotate-180' : ''}`}
          />
        </button>

        {showTemplates && (
          <div className="grid gap-4 md:grid-cols-2">
            {messageTemplates.map((template) => {
              const content = language === 'en' ? template.en : template.es
              const isExpanded = expandedTemplates.has(template.id)

              return (
                <div
                  key={template.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
                >
                  <div>
                    <p className="font-semibold text-white mb-1">{template.title}</p>
                    <p className={`text-sm text-white/60 ${!isExpanded ? 'line-clamp-2' : ''}`}>{content}</p>
                  </div>

                  <div className="flex gap-2">
                    {!isExpanded && (
                      <button
                        onClick={() => toggleTemplate(template.id)}
                        className="flex-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Expand
                      </button>
                    )}

                    <button
                      onClick={() => copyTemplate(template.id, content)}
                      className="flex items-center gap-2 flex-1 px-3 py-2 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-xs font-semibold text-blue-400"
                    >
                      {copiedTemplate === template.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <button
                      onClick={() => toggleTemplate(template.id)}
                      className="text-xs font-semibold text-white/60 hover:text-white transition-colors"
                    >
                      Collapse
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

export default DashboardPage

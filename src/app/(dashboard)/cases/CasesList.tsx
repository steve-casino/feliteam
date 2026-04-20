'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Case, User } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import SearchInput from '@/components/ui/SearchInput'
import StagePill from '@/components/ui/StagePill'
import Avatar from '@/components/ui/Avatar'
import { TREATMENT_GAP_DAYS, POLICE_REPORT_FLAG_DAYS } from '@/lib/constants'
import {
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  Plus,
  AlertCircle,
  Shield
} from 'lucide-react'
import { parseISO } from 'date-fns'

type ViewMode = 'grid' | 'list'
type SortBy = 'case_number' | 'date' | 'stage' | 'urgency'

interface CasesListProps {
  cases: Case[]
  users: User[]
}

const CasesPage: React.FC<CasesListProps> = ({ cases: mockCases, users: mockUsers }) => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('')
  const [stateFilter, setStateFilter] = useState<string>('')
  const [caseManagerFilter, setCaseManagerFilter] = useState<string>('')
  const [dateFromFilter, setDateFromFilter] = useState<string>('')
  const [dateToFilter, setDateToFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortBy>('urgency')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 12

  // Get unique states and case managers
  const uniqueStates = useMemo(() => {
    return Array.from(new Set(mockCases.map((c) => c.state))).sort()
  }, [])

  const uniqueCaseManagers = useMemo(() => {
    const managers = mockCases
      .filter((c) => c.assigned_case_manager_id)
      .map((c) => {
        const manager = mockUsers.find((u) => u.id === c.assigned_case_manager_id)
        return manager?.full_name
      })
      .filter(Boolean)

    return Array.from(new Set(managers)).sort() as string[]
  }, [])

  // Helper: Check if treatment gap exists
  const hasTreatmentGap = (caseObj: Case): boolean => {
    if (caseObj.treatment_status !== 'in_progress') return false
    // Simplified: check if any note exists and calculate from latest
    const now = new Date()
    const lastTreatmentDate = new Date(caseObj.updated_at)
    const daysSince = Math.floor(
      (now.getTime() - lastTreatmentDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSince > TREATMENT_GAP_DAYS
  }

  // Helper: Check if police report overdue
  const isPoliceReportOverdue = (caseObj: Case): boolean => {
    if (caseObj.police_report_status === 'obtained') return false
    if (caseObj.police_report_status === 'not_needed') return false
    const accidentDate = parseISO(caseObj.date_of_accident)
    const now = new Date()
    const daysSince = Math.floor(
      (now.getTime() - accidentDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSince > POLICE_REPORT_FLAG_DAYS
  }

  // Filter cases
  const filteredCases = useMemo(() => {
    return mockCases.filter((caseObj) => {
      // Search filter
      if (
        searchTerm &&
        !caseObj.case_number.includes(searchTerm) &&
        !caseObj.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      // Stage filter
      if (stageFilter && caseObj.stage !== stageFilter) {
        return false
      }

      // State filter
      if (stateFilter && caseObj.state !== stateFilter) {
        return false
      }

      // Case manager filter
      if (caseManagerFilter) {
        const manager = mockUsers.find(
          (u) => u.id === caseObj.assigned_case_manager_id
        )
        if (manager?.full_name !== caseManagerFilter) {
          return false
        }
      }

      // Date range filter
      if (dateFromFilter) {
        const caseDate = parseISO(caseObj.date_of_accident)
        if (caseDate < parseISO(dateFromFilter)) {
          return false
        }
      }

      if (dateToFilter) {
        const caseDate = parseISO(caseObj.date_of_accident)
        if (caseDate > parseISO(dateToFilter)) {
          return false
        }
      }

      return true
    })
  }, [
    searchTerm,
    stageFilter,
    stateFilter,
    caseManagerFilter,
    dateFromFilter,
    dateToFilter
  ])

  // Sort cases
  const sortedCases = useMemo(() => {
    const sorted = [...filteredCases]

    // Always prioritize urgent cases first
    sorted.sort((a, b) => {
      if (a.is_urgent && !b.is_urgent) return -1
      if (!a.is_urgent && b.is_urgent) return 1

      // Then apply secondary sort
      switch (sortBy) {
        case 'case_number':
          return a.case_number.localeCompare(b.case_number)
        case 'date':
          return (
            parseISO(b.date_of_accident).getTime() -
            parseISO(a.date_of_accident).getTime()
          )
        case 'stage':
          return a.stage.localeCompare(b.stage)
        case 'urgency':
        default:
          return 0
      }
    })

    return sorted
  }, [filteredCases, sortBy])

  // Paginate
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedCases.slice(start, start + itemsPerPage)
  }, [sortedCases, currentPage])

  const totalPages = Math.ceil(sortedCases.length / itemsPerPage)

  const renderCaseCard = (caseObj: Case) => {
    const caseManager = mockUsers.find(
      (u) => u.id === caseObj.assigned_case_manager_id
    )
    const hasGap = hasTreatmentGap(caseObj)
    const policeReportOverdue = isPoliceReportOverdue(caseObj)

    return (
      <Link key={caseObj.id} href={`/cases/${caseObj.id}`}>
        <Card
          variant={caseObj.is_urgent ? 'urgent' : 'default'}
          className="cursor-pointer group h-full"
        >
          <div className="space-y-4">
            {/* Case Number */}
            <div className="flex items-start justify-between">
              <code className="text-lg font-bold text-white tracking-wide">
                {caseObj.case_number}
              </code>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {caseObj.is_minor && (
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-red-500/20 text-red-300">
                    MINOR
                  </span>
                )}
                {caseObj.has_insurance_warning && (
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-500/20 text-orange-300">
                    NO INSURANCE
                  </span>
                )}
                {caseObj.is_urgent && (
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-coral-400/20 text-coral-400">
                    URGENT
                  </span>
                )}
                {!caseObj.police_report_number &&
                  caseObj.police_report_status !== 'not_needed' &&
                  policeReportOverdue && (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-amber-500/20 text-amber-300">
                      NO POLICE RPT
                    </span>
                  )}
              </div>
            </div>

            {/* Client Name */}
            <div>
              <p className="text-white font-semibold text-base group-hover:text-blue-300 transition-colors">
                {caseObj.client_name}
              </p>
            </div>

            {/* Stage Pill */}
            <div>
              <StagePill stage={caseObj.stage} />
            </div>

            {/* Case Manager & State */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {caseManager && (
                  <Avatar name={caseManager.full_name} size="sm" />
                )}
                <span className="text-sm text-white/80">
                  {caseManager?.full_name || 'Unassigned'}
                </span>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded bg-white/10 text-white/80">
                {caseObj.state}
              </span>
            </div>

            {/* Accident Date */}
            <div className="text-xs text-white/60">
              Accident:{' '}
              <span className="text-white/80 font-medium">
                {new Date(caseObj.date_of_accident).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* TX Limits (if applicable) */}
            {caseObj.state === 'TX' && (
              <div className="text-xs text-white/60">
                <span className="font-medium text-white/80">
                  {caseObj.insurance_bi_info}
                </span>
              </div>
            )}

            {/* Treatment Gap Warning */}
            {hasGap && (
              <div className="flex items-center gap-2 p-2 rounded bg-amber-500/20 border border-amber-500/30">
                <AlertCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span className="text-xs text-amber-200">
                  Treatment gap: {TREATMENT_GAP_DAYS}+ days
                </span>
              </div>
            )}
          </div>
        </Card>
      </Link>
    )
  }

  const renderTableRow = (caseObj: Case) => {
    const caseManager = mockUsers.find(
      (u) => u.id === caseObj.assigned_case_manager_id
    )
    const hasGap = hasTreatmentGap(caseObj)
    const policeReportOverdue = isPoliceReportOverdue(caseObj)

    return (
      <Link key={caseObj.id} href={`/cases/${caseObj.id}`}>
        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
          <td className="px-4 py-3">
            <code className="font-bold text-white">{caseObj.case_number}</code>
          </td>
          <td className="px-4 py-3 text-white">{caseObj.client_name}</td>
          <td className="px-4 py-3">
            <StagePill stage={caseObj.stage} />
          </td>
          <td className="px-4 py-3 text-sm text-white/80">
            {caseManager?.full_name || 'Unassigned'}
          </td>
          <td className="px-4 py-3 text-sm text-white/80">{caseObj.state}</td>
          <td className="px-4 py-3 text-sm text-white/80">
            {new Date(caseObj.date_of_accident).toLocaleDateString('en-US')}
          </td>
          <td className="px-4 py-3">
            <div className="flex flex-wrap gap-1">
              {caseObj.is_urgent && (
                <span className="px-2 py-1 text-xs rounded bg-coral-400/20 text-coral-400">
                  URGENT
                </span>
              )}
              {caseObj.is_minor && (
                <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300">
                  MINOR
                </span>
              )}
              {hasGap && (
                <span className="px-2 py-1 text-xs rounded bg-amber-500/20 text-amber-300">
                  GAP
                </span>
              )}
              {policeReportOverdue && (
                <span className="px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-300">
                  NO RPT
                </span>
              )}
            </div>
          </td>
        </tr>
      </Link>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Cases</h1>
          <p className="text-white/60 mt-1">
            Showing {paginatedCases.length} of {sortedCases.length} cases
          </p>
        </div>
        <Link href="/intake">
          <Button variant="primary" size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            New Intake
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <SearchInput
            placeholder="Search by case # or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            className="lg:col-span-2 sm:col-span-2"
          />

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => {
              setStageFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2.5 bg-navy-50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
          >
            <option value="">All Stages</option>
            <option value="new_case">New Case</option>
            <option value="trt">Treatment</option>
            <option value="liability">Liability</option>
            <option value="property_damage">Property Damage</option>
            <option value="dem">Demand</option>
            <option value="srl">Settlement/Litigation</option>
          </select>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2.5 bg-navy-50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
          >
            <option value="">All States</option>
            {uniqueStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          {/* Case Manager Filter */}
          <select
            value={caseManagerFilter}
            onChange={(e) => {
              setCaseManagerFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2.5 bg-navy-50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
          >
            <option value="">All Managers</option>
            {uniqueCaseManagers.map((manager) => (
              <option key={manager} value={manager}>
                {manager}
              </option>
            ))}
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateFromFilter}
            onChange={(e) => {
              setDateFromFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2.5 bg-navy-50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
          />

          {/* Date To */}
          <input
            type="date"
            value={dateToFilter}
            onChange={(e) => {
              setDateToFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2.5 bg-navy-50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Sort & View Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-1.5 bg-navy-50 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="urgency">Urgency (Urgent First)</option>
              <option value="case_number">Case Number</option>
              <option value="date">Date (Newest)</option>
              <option value="stage">Stage</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-navy-200/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-400/30 text-blue-400'
                  : 'text-white/50 hover:text-white'
              }`}
              title="Grid view"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-400/30 text-blue-400'
                  : 'text-white/50 hover:text-white'
              }`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Cases Grid or List */}
      {paginatedCases.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedCases.map(renderCaseCard)}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-sm">
                <thead className="bg-navy-50/50 border-b border-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-white">
                      Case #
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-white">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-white">
                      Stage
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-white">
                      Manager
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-white">
                      State
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-white">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-white">
                      Flags
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-navy-50">
                  {paginatedCases.map(renderTableRow)}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    currentPage <= 3 ? i + 1 : currentPage + i - 2
                  if (pageNum > totalPages) return null
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        pageNum === currentPage
                          ? 'bg-blue-400 text-white'
                          : 'text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="text-center py-12">
          <Shield className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 mb-4">No cases found matching your filters</p>
          <Link href="/intake">
            <Button variant="primary" size="md">
              Create New Case
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}

export default CasesPage

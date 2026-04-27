'use client'

import React, { useState, useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Plus, Edit2, Trash2, ToggleLeft } from 'lucide-react'
import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import AdminChatbox from '@/components/admin/AdminChatbox'
import { mockCases, mockUsers } from '@/lib/mock-data'
import { useTranslation } from '@/hooks/useLanguage'

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const getRoleColor = (r: string) => {
    const colors: Record<string, string> = {
      case_manager: 'bg-blue-600/20 text-blue-400',
      medical_manager: 'bg-teal-500/20 text-teal-400',
      intake_agent: 'bg-blue-500/20 text-blue-400',
      admin: 'bg-coral-500/20 text-coral-400'
    }
    return colors[r] || 'bg-white/10 text-white/60'
  }

  const getRoleLabel = (r: string) => {
    const labels: Record<string, string> = {
      case_manager: 'Case Manager',
      medical_manager: 'Medical Manager',
      intake_agent: 'Intake Agent',
      admin: 'Admin'
    }
    return labels[r] || r
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(role)}`}>
      {getRoleLabel(role)}
    </span>
  )
}

type AdminTab = 'analytics' | 'team' | 'settings'

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'case_manager' | 'intake_agent' | 'medical_manager'
  avatar_url?: string
  xp_points: number
  level: number
  created_at: string
  active: boolean
}

interface ManagerStats {
  name: string
  active_cases: number
  cases_closed: number
  avg_days: number
  checklist_percent: number
  xp: number
}

const AdminPage: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics')
  const [users, setUsers] = useState<AdminUser[]>(
    mockUsers.map((u) => ({ ...u, active: true }))
  )
  const [addUserModal, setAddUserModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<typeof mockUsers[0]['role']>('case_manager')

  const chartColors = {
    navy: '#0F0F1A',
    navy50: '#1A1A2E',
    blue: '#3B82F6',
    teal: '#1D9E75',
    coral: '#D85A30'
  }

  // Analytics Data
  const casesByStage = useMemo(() => {
    const stages = {
      new_case: 0,
      trt: 0,
      liability: 0,
      property_damage: 0,
      dem: 0,
      srl: 0
    }
    mockCases.forEach((c) => {
      stages[c.stage]++
    })
    return [
      { name: 'New Case', value: stages.new_case, color: '#9333EA' },
      { name: 'Treatment', value: stages.trt, color: '#3B82F6' },
      { name: 'Liability', value: stages.liability, color: '#FBBF24' },
      { name: 'Property Damage', value: stages.property_damage, color: '#F97316' },
      { name: 'Demand', value: stages.dem, color: '#14B8A6' },
      { name: 'Settlement/Litigation', value: stages.srl, color: '#22C55E' }
    ]
  }, [])

  const casesSignedPerManager = useMemo(() => {
    const managerCounts: Record<string, number> = {}
    mockCases.forEach((c) => {
      if (c.assigned_case_manager_id) {
        managerCounts[c.assigned_case_manager_id] = (managerCounts[c.assigned_case_manager_id] || 0) + 1
      }
    })

    return mockUsers
      .filter((u) => u.role === 'case_manager' || u.role === 'admin')
      .map((u) => ({
        name: u.full_name,
        cases: managerCounts[u.id] || 0
      }))
  }, [])

  const monthlyTrend = [
    { month: 'Nov', opened: 5, closed: 2 },
    { month: 'Dec', opened: 8, closed: 3 },
    { month: 'Jan', opened: 6, closed: 4 },
    { month: 'Feb', opened: 12, closed: 5 },
    { month: 'Mar', opened: 9, closed: 6 },
    { month: 'Apr', opened: 7, closed: 2 }
  ]

  const performanceData = useMemo(() => {
    const data: ManagerStats[] = []

    mockUsers
      .filter((u) => u.role === 'case_manager' || u.role === 'admin')
      .forEach((manager) => {
        const managerCases = mockCases.filter((c) => c.assigned_case_manager_id === manager.id)
        const closedCases = managerCases.filter((c) => c.stage === 'srl')
        const avgDays =
          managerCases.length > 0
            ? Math.round(
              managerCases.reduce((sum, c) => {
                const created = new Date(c.created_at)
                const updated = new Date(c.updated_at)
                return sum + Math.round((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
              }, 0) / managerCases.length
            )
            : 0

        data.push({
          name: manager.full_name,
          active_cases: managerCases.filter((c) => c.stage !== 'srl').length,
          cases_closed: closedCases.length,
          avg_days: avgDays,
          checklist_percent: Math.floor(Math.random() * 30) + 70,
          xp: manager.xp_points
        })
      })

    return data
  }, [])

  const overviewStats = [
    {
      label: 'Total Active Cases',
      value: mockCases.filter((c) => c.stage !== 'srl').length,
      trend: '+12%',
      color: 'text-blue-400'
    },
    {
      label: 'Cases Closed This Month',
      value: 4,
      trend: '+2',
      color: 'text-teal-400'
    },
    {
      label: 'Avg Days to Settlement',
      value: 45,
      trend: '-3 days',
      color: 'text-coral-400'
    },
    {
      label: 'Treatment Attendance Rate',
      value: '94%',
      trend: '+2%',
      color: 'text-blue-400'
    }
  ]

  const [sortColumn, setSortColumn] = useState<keyof ManagerStats>('cases_closed')
  const [sortDesc, setSortDesc] = useState(true)

  const sortedPerformance = useMemo(() => {
    const sorted = [...performanceData]
    sorted.sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDesc ? bVal - aVal : aVal - bVal
      }
      return 0
    })
    return sorted
  }, [performanceData, sortColumn, sortDesc])

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return

    const newUser: AdminUser = {
      id: `user-${Date.now()}`,
      email: newUserEmail,
      full_name: newUserName,
      role: newUserRole,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUserName}`,
      xp_points: 0,
      level: 1,
      created_at: new Date().toISOString(),
      active: true
    }

    setUsers([...users, newUser])
    setNewUserName('')
    setNewUserEmail('')
    setNewUserRole('case_manager')
    setAddUserModal(false)
  }

  const handleToggleUser = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, active: !u.active } : u)))
  }

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId))
  }

  return (
    <div className="w-full space-y-6">
      {/* AI chatbox — pinned to the top, before any panels */}
      <AdminChatbox />

      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
        <p className="text-white/60">System management, analytics, and user administration</p>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        {(['analytics', 'team', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-white/50 hover:text-white/70'
            }`}
          >
            {tab === 'analytics' && 'Analytics'}
            {tab === 'team' && 'Team'}
            {tab === 'settings' && 'Settings'}
          </button>
        ))}
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map((stat) => (
              <Card key={stat.label} className="space-y-3">
                <p className="text-white/70 text-sm font-medium">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
                  <p className="text-green-400 text-sm font-medium">{stat.trend}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Cases by Stage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={casesByStage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {casesByStage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.navy50,
                      border: `1px solid ${chartColors.navy}`,
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: chartColors.blue }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {casesByStage.map((stage) => (
                  <div key={stage.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <p className="text-white/70">{stage.name}</p>
                    <p className="text-white/50 ml-auto">{stage.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Cases Signed Per Manager</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={casesSignedPerManager}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.navy50,
                      border: `1px solid ${chartColors.navy}`,
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: chartColors.blue }}
                  />
                  <Bar dataKey="cases" fill={chartColors.blue} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-white">6-Month Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.navy50,
                    border: `1px solid ${chartColors.navy}`,
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: chartColors.blue }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="opened"
                  stroke={chartColors.blue}
                  strokeWidth={2}
                  dot={{ fill: chartColors.blue, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="closed"
                  stroke={chartColors.teal}
                  strokeWidth={2}
                  dot={{ fill: chartColors.teal, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="space-y-4 overflow-x-auto">
            <h3 className="text-lg font-semibold text-white">Performance by Manager</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-2 text-white/70 font-medium">Manager</th>
                  <th
                    className="text-center px-4 py-2 text-white/70 font-medium cursor-pointer hover:text-white"
                    onClick={() => {
                      if (sortColumn === 'active_cases') {
                        setSortDesc(!sortDesc)
                      } else {
                        setSortColumn('active_cases')
                        setSortDesc(true)
                      }
                    }}
                  >
                    Active Cases
                  </th>
                  <th
                    className="text-center px-4 py-2 text-white/70 font-medium cursor-pointer hover:text-white"
                    onClick={() => {
                      if (sortColumn === 'cases_closed') {
                        setSortDesc(!sortDesc)
                      } else {
                        setSortColumn('cases_closed')
                        setSortDesc(true)
                      }
                    }}
                  >
                    Closed
                  </th>
                  <th className="text-center px-4 py-2 text-white/70 font-medium">Avg Days</th>
                  <th className="text-center px-4 py-2 text-white/70 font-medium">Checklist %</th>
                  <th className="text-center px-4 py-2 text-white/70 font-medium">XP</th>
                </tr>
              </thead>
              <tbody>
                {sortedPerformance.map((manager) => (
                  <tr key={manager.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{manager.name}</td>
                    <td className="text-center px-4 py-3 text-white/70">{manager.active_cases}</td>
                    <td className="text-center px-4 py-3 text-teal-400 font-semibold">{manager.cases_closed}</td>
                    <td className="text-center px-4 py-3 text-white/70">{manager.avg_days}d</td>
                    <td className="text-center px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-semibold">
                        {manager.checklist_percent}%
                      </span>
                    </td>
                    <td className="text-center px-4 py-3 text-blue-400 font-semibold">
                      +{manager.xp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setAddUserModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>

          <Card className="space-y-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-white/70 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-white/70 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-white/70 font-medium">Role</th>
                  <th className="text-center px-4 py-3 text-white/70 font-medium">XP</th>
                  <th className="text-center px-4 py-3 text-white/70 font-medium">Level</th>
                  <th className="text-center px-4 py-3 text-white/70 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${!user.active ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.full_name} src={user.avatar_url} size="sm" />
                        <div>
                          <p className="text-white font-medium">{user.full_name}</p>
                          <p className="text-white/50 text-xs">
                            {user.active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70">{user.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="text-center px-4 py-3 text-blue-400 font-semibold">
                      {user.xp_points}
                    </td>
                    <td className="text-center px-4 py-3 text-teal-400 font-semibold">
                      Lvl {user.level}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleUser(user.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.active
                              ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          <ToggleLeft className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
            <div className="space-y-3">
              {['Treatment Gaps', 'Police Report Flags', 'Document Received', 'Case Assignment', 'Badge Earned'].map(
                (notif) => (
                  <label key={notif} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-blue-400" />
                    <span className="text-white/80">{notif}</span>
                  </label>
                )
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Auto-Assignment Rules</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-blue-400" />
              <span className="text-white/80">Enable auto-assignment</span>
            </label>
            <p className="text-white/60 text-sm">
              Cases are automatically assigned to the case manager with the fewest active cases and matching case type
              expertise.
            </p>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Clinic Database</h3>
            <div className="space-y-2">
              {['Austin Physical Therapy & Wellness', 'Dell Seton Medical Center', 'Orlando Regional Medical Center'].map(
                (clinic) => (
                  <div key={clinic} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                    <span className="text-white/70 text-sm">{clinic}</span>
                    <button className="text-red-400 hover:text-red-300 transition-colors text-sm">Remove</button>
                  </div>
                )
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new clinic..."
                className="flex-1 px-3 py-2 bg-navy rounded-lg border border-white/10 text-white placeholder:text-white/40 focus:border-blue-400/50 focus:outline-none text-sm"
              />
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
                Add
              </button>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Insurance Company Database</h3>
            <div className="space-y-2">
              {['State Farm', 'USAA', 'Progressive Insurance', 'Allstate'].map((company) => (
                <div key={company} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                  <span className="text-white/70 text-sm">{company}</span>
                  <button className="text-red-400 hover:text-red-300 transition-colors text-sm">Remove</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new insurance company..."
                className="flex-1 px-3 py-2 bg-navy rounded-lg border border-white/10 text-white placeholder:text-white/40 focus:border-blue-400/50 focus:outline-none text-sm"
              />
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
                Add
              </button>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-white">System Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Firm Name</label>
                <input
                  type="text"
                  defaultValue="Your Law Firm"
                  className="w-full px-4 py-2 bg-navy rounded-lg border border-white/10 text-white focus:border-blue-400/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Default State</label>
                <select className="w-full px-4 py-2 bg-navy rounded-lg border border-white/10 text-white focus:border-blue-400/50 focus:outline-none">
                  <option>Texas</option>
                  <option>Florida</option>
                </select>
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Save Settings
              </button>
            </div>
          </Card>
        </div>
      )}

      <Modal isOpen={addUserModal} onClose={() => setAddUserModal(false)} title="Add New User">
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 bg-navy rounded-lg border border-white/10 text-white placeholder:text-white/40 focus:border-blue-400/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="john@injuryflow.com"
              className="w-full px-4 py-2 bg-navy rounded-lg border border-white/10 text-white placeholder:text-white/40 focus:border-blue-400/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Role</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as any)}
              className="w-full px-4 py-2 bg-navy rounded-lg border border-white/10 text-white focus:border-blue-400/50 focus:outline-none"
            >
              <option value="case_manager">Case Manager</option>
              <option value="medical_manager">Medical Manager</option>
              <option value="intake_agent">Intake Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            onClick={handleAddUser}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Add User
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default AdminPage

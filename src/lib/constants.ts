import { CaseStage, UserRole, Badge } from '@/types'

export const CASE_STAGES: Array<{
  label: string
  value: CaseStage
  color: string
  description: string
}> = [
  {
    label: 'New Case',
    value: 'new_case',
    color: 'purple',
    description: 'Case intake and initial setup'
  },
  {
    label: 'Treatment',
    value: 'trt',
    color: 'blue',
    description: 'Client undergoing medical treatment'
  },
  {
    label: 'Liability',
    value: 'liability',
    color: 'amber',
    description: 'Establishing liability and liability limits'
  },
  {
    label: 'Property Damage',
    value: 'property_damage',
    color: 'orange',
    description: 'Vehicle/property damage claims'
  },
  {
    label: 'Demand',
    value: 'dem',
    color: 'teal',
    description: 'Settlement demand sent'
  },
  {
    label: 'Settlement/Litigation',
    value: 'srl',
    color: 'green',
    description: 'Settlement negotiation or litigation'
  }
]

export const ROLES: Array<{
  label: string
  value: UserRole
  description: string
}> = [
  {
    label: 'Admin',
    value: 'admin',
    description: 'Full system access and user management'
  },
  {
    label: 'Case Manager',
    value: 'case_manager',
    description: 'Manage cases and coordinate treatment'
  },
  {
    label: 'Medical Manager',
    value: 'medical_manager',
    description: 'Manage medical treatment and records'
  },
  {
    label: 'Intake Agent',
    value: 'intake_agent',
    description: 'Process new cases and client intake'
  }
]

export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'intake-pro',
    name: 'Intake Pro',
    description: 'Successfully intake 10 new cases',
    icon: 'clipboard-check',
    xp_reward: 100
  },
  {
    id: 'treatment-tracker',
    name: 'Treatment Tracker',
    description: 'Maintain 100% treatment documentation',
    icon: 'activity',
    xp_reward: 150
  },
  {
    id: 'settlement-royalty',
    name: 'Settlement Royalty',
    description: 'Close 5 cases with settlements',
    icon: 'crown',
    xp_reward: 250
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Complete all weekly checklists',
    icon: 'zap',
    xp_reward: 75
  },
  {
    id: 'bilingual-star',
    name: 'Bilingual Star',
    description: 'Handle 15 cases with Spanish communication',
    icon: 'globe',
    xp_reward: 125
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Close case in under 6 months',
    icon: 'rocket',
    xp_reward: 200
  },
  {
    id: 'documentation-master',
    name: 'Documentation Master',
    description: 'Perfect documentation on 10 cases',
    icon: 'file-check',
    xp_reward: 175
  },
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Receive 20 team shoutouts',
    icon: 'heart',
    xp_reward: 100
  }
]

export const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Junior Associate', xp_required: 0 },
  { level: 2, name: 'Associate', xp_required: 500 },
  { level: 3, name: 'Senior Associate', xp_required: 2000 },
  { level: 4, name: 'Partner Track', xp_required: 5000 }
]

// Texas and Florida insurance limits
export const TEXAS_BI_LIMIT = 30000
export const TEXAS_PD_LIMIT = 25000
export const FLORIDA_BI_LIMIT = 25000
export const FLORIDA_PD_LIMIT = 25000

// Case management thresholds
export const TREATMENT_GAP_DAYS = 14
export const POLICE_REPORT_FLAG_DAYS = 7
export const LOR_FOLLOW_UP_DAYS = 30

// Notification settings
export const NOTIFICATION_RETENTION_DAYS = 30

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_SORT_ORDER = 'desc'

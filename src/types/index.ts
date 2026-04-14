// User Types
export type UserRole = 'admin' | 'case_manager' | 'intake_agent' | 'medical_manager'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  xp_points: number
  level: number
  created_at: string
}

// Case Types
export type CaseStage = 'new_case' | 'trt' | 'liability' | 'property_damage' | 'dem' | 'srl'

export interface Case {
  id: string
  case_number: string
  client_name: string
  client_phone: string
  client_dob: string
  date_of_accident: string
  state: string
  zip_code: string
  insurance_um_policy?: string
  insurance_bi_info?: string
  accident_description: string
  opposing_party?: string
  police_report_number?: string
  stage: CaseStage
  assigned_case_manager_id?: string
  assigned_medical_manager_id?: string
  clinic_info?: string
  treatment_status: 'not_started' | 'in_progress' | 'completed' | 'gap'
  bi_lor_status: 'pending' | 'sent' | 'received'
  um_pip_lor_status: 'pending' | 'sent' | 'received'
  police_report_status: 'pending' | 'obtained' | 'not_needed'
  demographics_sent: boolean
  lor_sent: boolean
  first_treatment_confirmed: boolean
  is_minor: boolean
  is_urgent: boolean
  has_insurance_warning: boolean
  vehicle_impound_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Case Note Types
export type CaseNoteType = 'note' | 'call_log' | 'treatment_log' | 'stage_change'

export interface CaseNote {
  id: string
  case_id: string
  user_id: string
  content: string
  type: CaseNoteType
  created_at: string
}

// Checklist Types
export interface ChecklistItem {
  id: string
  case_manager_id: string
  case_id: string
  label: string
  category: string
  completed: boolean
  date: string
}

// Badge Types
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  xp_reward: number
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

// Team Post Types
export type TeamPostType = 'announcement' | 'celebration' | 'shoutout' | 'poll'

export interface TeamPost {
  id: string
  user_id: string
  content: string
  type: TeamPostType
  reactions: Record<string, string[]>
  created_at: string
}

// Notification Types
export type NotificationType =
  | 'case_assigned'
  | 'stage_change'
  | 'treatment_gap'
  | 'police_report_flag'
  | 'document_received'
  | 'badge_earned'
  | 'team_post'
  | 'deadline'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  created_at: string
}

// Leaderboard Types
export interface LeaderboardEntry {
  user_id: string
  user_name: string
  avatar: string
  xp: number
  cases_closed: number
  checklist_rate: number
  level: number
}

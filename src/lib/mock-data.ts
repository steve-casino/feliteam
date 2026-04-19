import {
  User,
  Case,
  CaseNote,
  ChecklistItem,
  Notification,
  TeamPost,
  LeaderboardEntry,
  UserBadge
} from '@/types'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'maria.santos@injuryflow.com',
    full_name: 'Maria Santos',
    role: 'admin',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    xp_points: 8500,
    level: 4,
    created_at: '2023-01-15T00:00:00Z'
  },
  {
    id: 'user-2',
    email: 'carlos.rivera@injuryflow.com',
    full_name: 'Carlos Rivera',
    role: 'case_manager',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    xp_points: 5800,
    level: 3,
    created_at: '2023-03-20T00:00:00Z'
  },
  {
    id: 'user-3',
    email: 'jessica.chen@injuryflow.com',
    full_name: 'Jessica Chen',
    role: 'case_manager',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    xp_points: 4200,
    level: 2,
    created_at: '2023-05-10T00:00:00Z'
  },
  {
    id: 'user-4',
    email: 'ahmed.hassan@injuryflow.com',
    full_name: 'Ahmed Hassan',
    role: 'intake_agent',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    xp_points: 1800,
    level: 1,
    created_at: '2024-01-05T00:00:00Z'
  }
]

// Mock Cases
export const mockCases: Case[] = [
  {
    id: 'case-1',
    case_number: '211500',
    client_name: 'John Martinez',
    client_phone: '(512) 555-0101',
    client_dob: '1985-06-15',
    date_of_accident: '2024-03-10',
    state: 'TX',
    zip_code: '78701',
    insurance_um_policy: '$50,000',
    insurance_bi_info: '$30,000/$60,000',
    accident_description:
      'Rear-end collision on I-35 north. Client was stopped at traffic light when struck by commercial vehicle.',
    opposing_party: 'ABC Logistics Inc.',
    police_report_number: 'APD-2024-451802',
    stage: 'trt',
    assigned_case_manager_id: 'user-2',
    assigned_medical_manager_id: 'user-3',
    clinic_info: 'Austin Physical Therapy & Wellness',
    treatment_status: 'in_progress',
    bi_lor_status: 'sent',
    um_pip_lor_status: 'pending',
    police_report_status: 'obtained',
    demographics_sent: true,
    lor_sent: true,
    first_treatment_confirmed: true,
    is_minor: false,
    is_urgent: true,
    has_insurance_warning: false,
    vehicle_impound_date: '2024-03-10',
    notes: 'Client has neck and back pain. Ongoing PT treatment. Great recovery progress.',
    created_at: '2024-03-11T10:30:00Z',
    updated_at: '2024-04-05T14:22:00Z'
  },
  {
    id: 'case-2',
    case_number: '211501',
    client_name: 'Maria Lopez',
    client_phone: '(512) 555-0102',
    client_dob: '1992-11-22',
    date_of_accident: '2024-02-05',
    state: 'TX',
    zip_code: '78702',
    insurance_um_policy: '$100,000',
    insurance_bi_info: '$30,000/$60,000',
    accident_description:
      'Side-impact collision at intersection. Other vehicle ran red light. Two passengers also injured.',
    opposing_party: 'Unknown Driver (Hit and Run)',
    police_report_number: 'APD-2024-428501',
    stage: 'liability',
    assigned_case_manager_id: 'user-3',
    assigned_medical_manager_id: 'user-2',
    clinic_info: 'Dell Seton Medical Center',
    treatment_status: 'completed',
    bi_lor_status: 'received',
    um_pip_lor_status: 'received',
    police_report_status: 'obtained',
    demographics_sent: true,
    lor_sent: true,
    first_treatment_confirmed: true,
    is_minor: false,
    is_urgent: false,
    has_insurance_warning: true,
    notes:
      'UM case - other driver uninsured. Client completed ER treatment. Waiting on radiology reports.',
    created_at: '2024-02-06T08:15:00Z',
    updated_at: '2024-04-08T09:45:00Z'
  },
  {
    id: 'case-3',
    case_number: '211502',
    client_name: 'David Thompson',
    client_phone: '(407) 555-0103',
    client_dob: '1978-03-08',
    date_of_accident: '2024-01-18',
    state: 'FL',
    zip_code: '32806',
    insurance_um_policy: '$50,000',
    insurance_bi_info: '$25,000/$50,000',
    accident_description:
      'Motorcycle accident. Client hit pothole in road and lost control. Significant road rash and minor fractures.',
    opposing_party: 'City of Orlando (Municipal Liability)',
    police_report_number: 'OPD-2024-334521',
    stage: 'dem',
    assigned_case_manager_id: 'user-2',
    assigned_medical_manager_id: 'user-3',
    clinic_info: 'Orlando Regional Medical Center',
    treatment_status: 'completed',
    bi_lor_status: 'received',
    um_pip_lor_status: 'received',
    police_report_status: 'obtained',
    demographics_sent: true,
    lor_sent: true,
    first_treatment_confirmed: true,
    is_minor: false,
    is_urgent: false,
    has_insurance_warning: false,
    notes:
      'Municipal liability claim filed. Treatment completed. Demand letter prepared. $45,000 demand sent.',
    created_at: '2024-01-20T11:20:00Z',
    updated_at: '2024-04-09T16:30:00Z'
  },
  {
    id: 'case-4',
    case_number: '211503',
    client_name: 'Sarah Williams',
    client_phone: '(512) 555-0104',
    client_dob: '2008-07-14',
    date_of_accident: '2024-03-25',
    state: 'TX',
    zip_code: '78704',
    insurance_um_policy: '$25,000',
    insurance_bi_info: '$30,000/$60,000',
    accident_description: 'Minor fender bender in parking lot. Client vehicle backed into by another vehicle.',
    opposing_party: 'Insured (Progressive Insurance)',
    police_report_number: undefined,
    stage: 'property_damage',
    assigned_case_manager_id: 'user-3',
    assigned_medical_manager_id: undefined,
    clinic_info: undefined,
    treatment_status: 'not_started',
    bi_lor_status: 'pending',
    um_pip_lor_status: 'pending',
    police_report_status: 'not_needed',
    demographics_sent: false,
    lor_sent: false,
    first_treatment_confirmed: false,
    is_minor: true,
    is_urgent: false,
    has_insurance_warning: false,
    notes: 'Minor property damage claim. No bodily injury reported. Minor client - parent involved.',
    created_at: '2024-03-26T14:00:00Z',
    updated_at: '2024-04-03T10:15:00Z'
  },
  {
    id: 'case-5',
    case_number: '211504',
    client_name: 'Robert Jackson',
    client_phone: '(512) 555-0105',
    client_dob: '1988-09-30',
    date_of_accident: '2024-04-01',
    state: 'TX',
    zip_code: '78701',
    insurance_um_policy: '$100,000',
    insurance_bi_info: '$30,000/$60,000',
    accident_description:
      'Motorcycle vs car collision on Burnet Road. Client thrown from bike. Multiple injuries.',
    opposing_party: 'State Farm Insured',
    police_report_number: 'APD-2024-499123',
    stage: 'new_case',
    assigned_case_manager_id: 'user-2',
    assigned_medical_manager_id: undefined,
    clinic_info: undefined,
    treatment_status: 'in_progress',
    bi_lor_status: 'pending',
    um_pip_lor_status: 'pending',
    police_report_status: 'pending',
    demographics_sent: true,
    lor_sent: false,
    first_treatment_confirmed: true,
    is_minor: false,
    is_urgent: true,
    has_insurance_warning: false,
    vehicle_impound_date: '2024-04-01',
    notes: 'Recently intaken. Client hospitalized for observation. Serious case. Police report pending.',
    created_at: '2024-04-02T09:00:00Z',
    updated_at: '2024-04-10T08:30:00Z'
  },
  {
    id: 'case-6',
    case_number: '211505',
    client_name: 'Emma Rodriguez',
    client_phone: '(407) 555-0106',
    client_dob: '1995-05-12',
    date_of_accident: '2024-02-20',
    state: 'FL',
    zip_code: '32801',
    insurance_um_policy: '$75,000',
    insurance_bi_info: '$25,000/$50,000',
    accident_description:
      'Slip and fall at grocery store. Wet floor, no warning signs. Client fell and injured shoulder.',
    opposing_party: 'Publix Super Market (Property Owner)',
    police_report_number: undefined,
    stage: 'srl',
    assigned_case_manager_id: 'user-3',
    assigned_medical_manager_id: 'user-2',
    clinic_info: 'Dr. Garcia Orthopedic Clinic',
    treatment_status: 'completed',
    bi_lor_status: 'received',
    um_pip_lor_status: 'pending',
    police_report_status: 'not_needed',
    demographics_sent: true,
    lor_sent: true,
    first_treatment_confirmed: true,
    is_minor: false,
    is_urgent: false,
    has_insurance_warning: false,
    notes: 'Property liability claim. Demand rejected. Case going to litigation. Discovery underway.',
    created_at: '2024-02-22T13:45:00Z',
    updated_at: '2024-04-09T11:20:00Z'
  },
  {
    id: 'case-7',
    case_number: '211506',
    client_name: 'Michael Chang',
    client_phone: '(512) 555-0107',
    client_dob: '1980-12-05',
    date_of_accident: '2024-03-05',
    state: 'TX',
    zip_code: '78705',
    insurance_um_policy: '$50,000',
    insurance_bi_info: '$30,000/$60,000',
    accident_description: 'Rear-end collision on Mopac. Other driver distracted (texting). Whiplash injury.',
    opposing_party: 'USAA Insured',
    police_report_number: 'APD-2024-445890',
    stage: 'liability',
    assigned_case_manager_id: 'user-3',
    assigned_medical_manager_id: undefined,
    clinic_info: 'Central Texas Chiropractic',
    treatment_status: 'in_progress',
    bi_lor_status: 'pending',
    um_pip_lor_status: 'pending',
    police_report_status: 'obtained',
    demographics_sent: true,
    lor_sent: false,
    first_treatment_confirmed: true,
    is_minor: false,
    is_urgent: false,
    has_insurance_warning: false,
    notes: 'Clear liability. Police report shows other driver at fault. Treatment ongoing.',
    created_at: '2024-03-06T10:30:00Z',
    updated_at: '2024-04-08T15:45:00Z'
  },
  {
    id: 'case-8',
    case_number: '211507',
    client_name: 'Lisa Patel',
    client_phone: '(407) 555-0108',
    client_dob: '1990-08-18',
    date_of_accident: '2024-01-25',
    state: 'FL',
    zip_code: '32802',
    insurance_um_policy: '$100,000',
    insurance_bi_info: '$25,000/$50,000',
    accident_description:
      'Multi-vehicle accident on I-4. Client injured in chain reaction collision. Significant injuries.',
    opposing_party: 'Multiple (Coordinated Claims)',
    police_report_number: 'FHP-2024-289023',
    stage: 'dem',
    assigned_case_manager_id: 'user-2',
    assigned_medical_manager_id: 'user-3',
    clinic_info: 'Advent Health System',
    treatment_status: 'completed',
    bi_lor_status: 'received',
    um_pip_lor_status: 'received',
    police_report_status: 'obtained',
    demographics_sent: true,
    lor_sent: true,
    first_treatment_confirmed: true,
    is_minor: false,
    is_urgent: false,
    has_insurance_warning: false,
    notes:
      'Complex multi-party case. Medical treatment complete. Total damages ~$75,000. Demand in negotiation.',
    created_at: '2024-01-27T07:00:00Z',
    updated_at: '2024-04-07T12:00:00Z'
  }
]

// Mock Case Notes
export const mockCaseNotes: CaseNote[] = [
  {
    id: 'note-1',
    case_id: 'case-1',
    user_id: 'user-2',
    content: 'Client called with pain update. PT going well. Can attend follow-up next week.',
    type: 'call_log',
    created_at: '2024-04-08T14:30:00Z'
  },
  {
    id: 'note-2',
    case_id: 'case-1',
    user_id: 'user-3',
    content: 'Treatment session #8 completed. Range of motion improving significantly.',
    type: 'treatment_log',
    created_at: '2024-04-07T16:00:00Z'
  },
  {
    id: 'note-3',
    case_id: 'case-2',
    user_id: 'user-3',
    content: 'Moved case from new_case to liability stage. Medical treatment complete.',
    type: 'stage_change',
    created_at: '2024-04-05T10:15:00Z'
  },
  {
    id: 'note-4',
    case_id: 'case-3',
    user_id: 'user-2',
    content: 'Settlement demand sent to city attorney. Awaiting response. 30 days until auto-denial.',
    type: 'note',
    created_at: '2024-04-03T11:45:00Z'
  },
  {
    id: 'note-5',
    case_id: 'case-5',
    user_id: 'user-2',
    content: 'Client stable and discharged from hospital. Started outpatient treatment today.',
    type: 'treatment_log',
    created_at: '2024-04-09T15:20:00Z'
  },
  {
    id: 'note-6',
    case_id: 'case-6',
    user_id: 'user-3',
    content: 'Demand rejected. Case moved to litigation. Discovery timeline: 60 days.',
    type: 'stage_change',
    created_at: '2024-04-02T09:00:00Z'
  }
]

// Mock Checklist Items
export const mockChecklistItems: ChecklistItem[] = [
  {
    id: 'checklist-1',
    case_manager_id: 'user-2',
    case_id: 'case-1',
    label: 'Collect intake documents from client',
    category: 'intake',
    completed: true,
    date: '2024-03-12'
  },
  {
    id: 'checklist-2',
    case_manager_id: 'user-2',
    case_id: 'case-1',
    label: 'Obtain police report',
    category: 'documentation',
    completed: true,
    date: '2024-03-18'
  },
  {
    id: 'checklist-3',
    case_manager_id: 'user-2',
    case_id: 'case-1',
    label: 'Send BI LOR to insurance',
    category: 'liability',
    completed: true,
    date: '2024-03-25'
  },
  {
    id: 'checklist-4',
    case_manager_id: 'user-2',
    case_id: 'case-1',
    label: 'Coordinate with medical provider',
    category: 'treatment',
    completed: true,
    date: '2024-03-20'
  },
  {
    id: 'checklist-5',
    case_manager_id: 'user-2',
    case_id: 'case-1',
    label: 'Prepare settlement demand',
    category: 'settlement',
    completed: false,
    date: '2024-05-01'
  },
  {
    id: 'checklist-6',
    case_manager_id: 'user-3',
    case_id: 'case-2',
    label: 'Obtain medical records',
    category: 'documentation',
    completed: true,
    date: '2024-02-20'
  },
  {
    id: 'checklist-7',
    case_manager_id: 'user-3',
    case_id: 'case-4',
    label: 'Collect parent authorization forms',
    category: 'intake',
    completed: true,
    date: '2024-03-27'
  },
  {
    id: 'checklist-8',
    case_manager_id: 'user-2',
    case_id: 'case-5',
    label: 'Schedule initial client meeting',
    category: 'intake',
    completed: true,
    date: '2024-04-02'
  },
  {
    id: 'checklist-9',
    case_manager_id: 'user-2',
    case_id: 'case-5',
    label: 'Follow up with hospital for records',
    category: 'documentation',
    completed: false,
    date: '2024-04-15'
  }
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-2',
    title: 'Treatment Gap Alert',
    message: 'Case 211500 (John Martinez) - 14 days since last treatment. Follow up with client.',
    type: 'treatment_gap',
    read: false,
    created_at: '2024-04-09T08:00:00Z'
  },
  {
    id: 'notif-2',
    user_id: 'user-2',
    title: 'Police Report Pending',
    message: 'Case 211505 (Robert Jackson) - Police report pending for 8 days. Follow up with APD.',
    type: 'police_report_flag',
    read: false,
    created_at: '2024-04-08T10:30:00Z'
  },
  {
    id: 'notif-3',
    user_id: 'user-3',
    title: 'Badge Earned!',
    message: 'You earned the "Perfect Week" badge! +75 XP',
    type: 'badge_earned',
    read: true,
    created_at: '2024-04-07T17:00:00Z'
  },
  {
    id: 'notif-4',
    user_id: 'user-2',
    title: 'Case Assigned',
    message: 'New urgent case assigned: Case 211505 (Robert Jackson)',
    type: 'case_assigned',
    read: true,
    created_at: '2024-04-02T09:15:00Z'
  },
  {
    id: 'notif-5',
    user_id: 'user-3',
    title: 'Document Received',
    message: 'BI LOR received from State Farm for Case 211501 (Maria Lopez)',
    type: 'document_received',
    read: true,
    created_at: '2024-04-06T14:45:00Z'
  },
  {
    id: 'notif-6',
    user_id: 'user-2',
    title: 'Team Shoutout',
    message: 'Maria Santos gave you a shoutout: "Great work on the Martinez settlement!"',
    type: 'team_post',
    read: false,
    created_at: '2024-04-09T09:20:00Z'
  }
]

// Mock Team Posts
export const mockTeamPosts: TeamPost[] = [
  {
    id: 'post-1',
    user_id: 'user-1',
    content:
      'Great news everyone! Carlos just closed the Thompson case with a $45,000 settlement. Excellent work on the investigation!',
    type: 'celebration',
    reactions: {
      '👍': ['user-2', 'user-3', 'user-4'],
      '🎉': ['user-2'],
      '🔥': ['user-3']
    },
    created_at: '2024-04-07T16:30:00Z'
  },
  {
    id: 'post-2',
    user_id: 'user-3',
    content:
      'Shoutout to Ahmed for stellar intake work this week! 5 new cases processed without any errors. Way to go!',
    type: 'shoutout',
    reactions: {
      '👏': ['user-1', 'user-2', 'user-4'],
      '⭐': ['user-2']
    },
    created_at: '2024-04-08T10:15:00Z'
  },
  {
    id: 'post-3',
    user_id: 'user-1',
    content:
      'Quick reminder: All team members must update their case status weekly. This helps us track deadlines and avoid missed follow-ups.',
    type: 'announcement',
    reactions: {
      '✅': ['user-2', 'user-3']
    },
    created_at: '2024-04-08T14:00:00Z'
  },
  {
    id: 'post-4',
    user_id: 'user-2',
    content:
      'Poll: Should we add weekly case review meetings to our calendar? Vote in the comments!',
    type: 'poll',
    reactions: {
      '✅': ['user-1', 'user-3', 'user-4'],
      '❌': ['user-4']
    },
    created_at: '2024-04-09T11:00:00Z'
  }
]

// Mock User Badges
export const mockUserBadges: UserBadge[] = [
  {
    id: 'ubadge-1',
    user_id: 'user-2',
    badge_id: 'intake-pro',
    earned_at: '2024-02-15T10:00:00Z'
  },
  {
    id: 'ubadge-2',
    user_id: 'user-2',
    badge_id: 'treatment-tracker',
    earned_at: '2024-03-20T14:30:00Z'
  },
  {
    id: 'ubadge-3',
    user_id: 'user-2',
    badge_id: 'settlement-royalty',
    earned_at: '2024-04-01T09:00:00Z'
  },
  {
    id: 'ubadge-4',
    user_id: 'user-3',
    badge_id: 'perfect-week',
    earned_at: '2024-04-07T17:00:00Z'
  },
  {
    id: 'ubadge-5',
    user_id: 'user-3',
    badge_id: 'treatment-tracker',
    earned_at: '2024-03-15T11:30:00Z'
  },
  {
    id: 'ubadge-6',
    user_id: 'user-4',
    badge_id: 'intake-pro',
    earned_at: '2024-03-25T13:45:00Z'
  }
]

// Mock Leaderboard Entries
export const mockLeaderboardEntries: LeaderboardEntry[] = [
  {
    user_id: 'user-1',
    user_name: 'Maria Santos',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    xp: 8500,
    cases_closed: 32,
    checklist_rate: 0.98,
    level: 4
  },
  {
    user_id: 'user-2',
    user_name: 'Carlos Rivera',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    xp: 5800,
    cases_closed: 18,
    checklist_rate: 0.95,
    level: 3
  },
  {
    user_id: 'user-3',
    user_name: 'Jessica Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    xp: 4200,
    cases_closed: 12,
    checklist_rate: 0.92,
    level: 2
  },
  {
    user_id: 'user-4',
    user_name: 'Ahmed Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    xp: 1800,
    cases_closed: 4,
    checklist_rate: 0.88,
    level: 1
  }
]

// Helper function to get mock data
export function getMockData() {
  return {
    users: mockUsers,
    cases: mockCases,
    notes: mockCaseNotes,
    checklistItems: mockChecklistItems,
    notifications: mockNotifications,
    teamPosts: mockTeamPosts,
    userBadges: mockUserBadges,
    leaderboardEntries: mockLeaderboardEntries
  }
}

-- InjuryFlow Supabase Schema
-- Complete PostgreSQL schema for personal injury law firm operations platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== ENUMS =====

CREATE TYPE user_role AS ENUM ('admin', 'case_manager', 'intake_agent', 'medical_manager');

CREATE TYPE case_stage AS ENUM (
  'new_case',
  'trt',
  'liability',
  'property_damage',
  'dem',
  'srl'
);

CREATE TYPE note_type AS ENUM ('note', 'call_log', 'treatment_log', 'stage_change');

CREATE TYPE post_type AS ENUM ('announcement', 'celebration', 'shoutout', 'poll');

-- ===== TABLES =====

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'intake_agent',
  avatar_url TEXT,
  xp_points INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Junior Associate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  client_name TEXT,
  client_phone TEXT,
  client_dob DATE,
  date_of_accident DATE,
  state TEXT,
  zip_code TEXT,
  insurance_um_policy TEXT,
  insurance_bi_info TEXT,
  accident_description TEXT,
  opposing_party TEXT,
  police_report_number TEXT,
  stage case_stage DEFAULT 'new_case',
  assigned_case_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_medical_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  clinic_info TEXT,
  treatment_status TEXT,
  bi_lor_status TEXT,
  um_pip_lor_status TEXT,
  police_report_status TEXT,
  demographics_sent BOOLEAN DEFAULT FALSE,
  lor_sent BOOLEAN DEFAULT FALSE,
  first_treatment_confirmed BOOLEAN DEFAULT FALSE,
  is_minor BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  has_insurance_warning BOOLEAN DEFAULT FALSE,
  vehicle_impound_date DATE,
  notes TEXT,
  language_preference TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case notes table
CREATE TABLE IF NOT EXISTS case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type note_type DEFAULT 'note',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 
-- Checklist items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_manager_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  category TEXT,
  completed BOOLEAN DEFAULT FALSE,
  date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0
);

-- User badges table (many-to-many)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Team posts table
CREATE TABLE IF NOT EXISTS team_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type post_type DEFAULT 'announcement',
  reactions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDEXES =====

CREATE INDEX IF NOT EXISTS idx_cases_stage ON cases(stage);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_case_manager_id ON cases(assigned_case_manager_id);
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);
CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON case_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_checklist_items_case_id ON checklist_items(case_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_case_manager_id ON checklist_items(case_manager_id);
CREATE INDEX IF NOT EXISTS idx_team_posts_user_id ON team_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- ===== ROW LEVEL SECURITY =====

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users RLS: Users can view their own profile and admins can view all
CREATE POLICY "users_select_self" ON users
  FOR SELECT USING (auth.uid() = id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "users_update_self" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Cases RLS: Case managers and admins can view assigned cases
CREATE POLICY "cases_select" ON cases
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    OR assigned_case_manager_id = auth.uid()
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'case_manager'
  );

CREATE POLICY "cases_insert_case_manager" ON cases
  FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'case_manager')
  );

CREATE POLICY "cases_update" ON cases
  FOR UPDATE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    OR assigned_case_manager_id = auth.uid()
  );

-- Case notes RLS: Users can see notes on cases they have access to
CREATE POLICY "case_notes_select" ON case_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_notes.case_id
      AND (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
        OR cases.assigned_case_manager_id = auth.uid()
      )
    )
  );

CREATE POLICY "case_notes_insert" ON case_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_notes.case_id
      AND (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
        OR cases.assigned_case_manager_id = auth.uid()
      )
    )
    AND user_id = auth.uid()
  );

-- Checklist items RLS
CREATE POLICY "checklist_items_select" ON checklist_items
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    OR case_manager_id = auth.uid()
  );

CREATE POLICY "checklist_items_insert" ON checklist_items
  FOR INSERT WITH CHECK (
    case_manager_id = auth.uid()
  );

CREATE POLICY "checklist_items_update" ON checklist_items
  FOR UPDATE USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    OR case_manager_id = auth.uid()
  );

-- Badges: All authenticated users can view
CREATE POLICY "badges_select" ON badges
  FOR SELECT USING (TRUE);

-- User badges: Users can see their own, admins can see all
CREATE POLICY "user_badges_select" ON user_badges
  FOR SELECT USING (
    user_id = auth.uid()
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "user_badges_insert" ON user_badges
  FOR INSERT WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Team posts: All authenticated users can view, users can insert their own
CREATE POLICY "team_posts_select" ON team_posts
  FOR SELECT USING (TRUE);

CREATE POLICY "team_posts_insert" ON team_posts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "team_posts_update" ON team_posts
  FOR UPDATE USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "team_posts_delete" ON team_posts
  FOR DELETE USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Notifications: Users can view their own
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_delete" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- ===== FUNCTIONS & TRIGGERS =====

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to users and cases
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

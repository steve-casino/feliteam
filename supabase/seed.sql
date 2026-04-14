-- InjuryFlow Seed Data
-- Sample data for development and testing

-- ===== INSERT USERS =====

-- Admin user
INSERT INTO users (id, email, full_name, role, xp_points, level) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@injuryflow.com', 'Alex Johnson', 'admin', 5000, 'Senior Partner');

-- Case managers
INSERT INTO users (id, email, full_name, role, xp_points, level) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'sarah.miller@injuryflow.com', 'Sarah Miller', 'case_manager', 3200, 'Senior Case Manager'),
('550e8400-e29b-41d4-a716-446655440003', 'james.chen@injuryflow.com', 'James Chen', 'case_manager', 2800, 'Case Manager'),
('550e8400-e29b-41d4-a716-446655440004', 'maya.patel@injuryflow.com', 'Maya Patel', 'case_manager', 2100, 'Case Manager');

-- Intake agents
INSERT INTO users (id, email, full_name, role, xp_points, level) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'jordan.smith@injuryflow.com', 'Jordan Smith', 'intake_agent', 1500, 'Intake Specialist'),
('550e8400-e29b-41d4-a716-446655440006', 'ashley.williams@injuryflow.com', 'Ashley Williams', 'intake_agent', 1200, 'Junior Intake Agent'),
('550e8400-e29b-41d4-a716-446655440007', 'marcus.davis@injuryflow.com', 'Marcus Davis', 'intake_agent', 950, 'Junior Intake Agent');

-- Medical managers
INSERT INTO users (id, email, full_name, role, xp_points, level) VALUES
('550e8400-e29b-41d4-a716-446655440008', 'dr.jennifer.lee@injuryflow.com', 'Dr. Jennifer Lee', 'medical_manager', 2600, 'Senior Medical Manager'),
('550e8400-e29b-41d4-a716-446655440009', 'dr.robert.taylor@injuryflow.com', 'Dr. Robert Taylor', 'medical_manager', 1800, 'Medical Manager');

-- ===== INSERT CASES =====

-- New cases
INSERT INTO cases (
  id, case_number, client_name, client_phone, client_dob, date_of_accident, state, zip_code,
  insurance_um_policy, insurance_bi_info, accident_description, opposing_party,
  stage, assigned_case_manager_id, assigned_medical_manager_id, is_urgent, created_at
) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'INJ-2024-001', 'Robert Johnson', '555-0101', '1985-03-15', '2024-04-10', 'CA', '90210',
  '100/300', '50/100', 'Multi-vehicle collision on I-405', 'State Farm Insurance', 'new_case', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440008', true, NOW()),

('650e8400-e29b-41d4-a716-446655440002', 'INJ-2024-002', 'Emily Watson', '555-0102', '1992-07-22', '2024-04-08', 'CA', '90211',
  '75/250', '40/80', 'Slip and fall at retail store', 'ABC Retail Corp', 'new_case', '550e8400-e29b-41d4-a716-446655440003', NULL, false, NOW()),

('650e8400-e29b-41d4-a716-446655440003', 'INJ-2024-003', 'Michael Torres', '555-0103', '1978-11-30', '2024-04-05', 'CA', '90212',
  '50/200', '30/60', 'Workplace injury - manufacturing facility', 'Acme Manufacturing', 'trt', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440009', false, NOW() - INTERVAL '5 days');

-- Cases in different stages
INSERT INTO cases (
  id, case_number, client_name, client_phone, client_dob, date_of_accident, state, zip_code,
  insurance_um_policy, insurance_bi_info, accident_description, opposing_party,
  stage, assigned_case_manager_id, assigned_medical_manager_id, demographics_sent, lor_sent, first_treatment_confirmed, created_at
) VALUES
('650e8400-e29b-41d4-a716-446655440004', 'INJ-2024-004', 'Jessica Brown', '555-0104', '1988-01-12', '2024-03-20', 'CA', '90213',
  '100/300', '50/100', 'Pedestrian struck by vehicle', 'Geico Insurance', 'liability', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', true, true, true, NOW() - INTERVAL '15 days'),

('650e8400-e29b-41d4-a716-446655440005', 'INJ-2024-005', 'David Martinez', '555-0105', '1995-05-08', '2024-02-28', 'CA', '90214',
  '75/250', '40/80', 'Motorcycle accident - intersection collision', 'Progressive Insurance', 'property_damage', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440009', true, true, true, NOW() - INTERVAL '30 days'),

('650e8400-e29b-41d4-a716-446655440006', 'INJ-2024-006', 'Sophia Anderson', '555-0106', '1990-09-25', '2024-02-10', 'CA', '90215',
  '50/200', '25/50', 'Product liability - appliance malfunction', 'Allstate', 'dem', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440008', true, true, true, NOW() - INTERVAL '45 days');

-- Minor case
INSERT INTO cases (
  id, case_number, client_name, client_phone, client_dob, date_of_accident, state, zip_code,
  insurance_um_policy, insurance_bi_info, accident_description, opposing_party,
  stage, assigned_case_manager_id, assigned_medical_manager_id, is_minor, lor_sent, created_at
) VALUES
('650e8400-e29b-41d4-a716-446655440007', 'INJ-2024-007', 'Emma Wilson', '555-0107', '2008-06-14', '2024-03-15', 'CA', '90216',
  '50/150', '25/50', 'School playground injury', 'School District Insurer', 'trt', '550e8400-e29b-41d4-a716-446655440003', NULL, true, false, NOW() - INTERVAL '10 days');

-- ===== INSERT CASE NOTES =====

INSERT INTO case_notes (id, case_id, user_id, content, type, created_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002',
 'Initial intake call completed. Client reports neck and lower back pain. Medical treatment already started at local clinic.', 'call_log', NOW() - INTERVAL '2 hours'),

('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440008',
 'Medical review: MRI shows moderate disc herniation at L4-L5. Recommend continued PT and follow-up with specialist.', 'treatment_log', NOW() - INTERVAL '1 hour'),

('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003',
 'Scheduling first treatment appointment. Client preference: Tuesday or Thursday afternoons.', 'note', NOW() - INTERVAL '30 minutes'),

('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002',
 'Case moved to treatment/recovery phase. Client attending PT twice weekly.', 'stage_change', NOW() - INTERVAL '5 days'),

('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003',
 'Liability determination: Clear liability on defendant. Opposing counsel has accepted liability. Proceeding to settlement negotiations.', 'note', NOW() - INTERVAL '15 days');

-- ===== INSERT CHECKLIST ITEMS =====

INSERT INTO checklist_items (id, case_manager_id, case_id, label, category, completed, date, created_at) VALUES
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001',
 'Obtain medical records from primary care physician', 'Medical', true, '2024-04-12', NOW() - INTERVAL '1 day'),

('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001',
 'Send Letter of Representation to insurance company', 'Documentation', false, '2024-04-15', NOW()),

('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002',
 'Verify insurance policy limits', 'Insurance', true, '2024-04-11', NOW() - INTERVAL '2 days'),

('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002',
 'Request police report from local department', 'Documentation', false, '2024-04-18', NOW()),

('850e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003',
 'Complete worker compensation claim filing', 'Legal', true, '2024-04-09', NOW() - INTERVAL '8 days');

-- ===== INSERT BADGES =====

INSERT INTO badges (id, name, description, icon, xp_reward) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'First Case', 'Assigned and managed your first case', 'briefcase', 100),
('950e8400-e29b-41d4-a716-446655440002', 'Speed Demon', 'Processed 5 cases in a single week', 'zap', 250),
('950e8400-e29b-41d4-a716-446655440003', 'Liability Expert', 'Determined liability in 10 cases', 'scale', 200),
('950e8400-e29b-41d4-a716-446655440004', 'Healing Hands', 'Coordinated medical care for 15 cases', 'heart', 150),
('950e8400-e29b-41d4-a716-446655440005', 'Settlement Master', 'Negotiated and closed 5 settlements', 'handshake', 300),
('950e8400-e29b-41d4-a716-446655440006', 'Early Bird', 'Completed 3 cases in under 30 days', 'sunrise', 180),
('950e8400-e29b-41d4-a716-446655440007', 'Team Player', 'Earned 5 team shoutouts from colleagues', 'users', 120),
('950e8400-e29b-41d4-a716-446655440008', 'Case Closer', 'Successfully closed your first case', 'check-circle', 150);

-- ===== INSERT USER BADGES =====

INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '60 days'),
('550e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '45 days'),
('550e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '15 days'),
('550e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '50 days'),
('550e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '25 days'),
('550e8400-e29b-41d4-a716-446655440008', '950e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '40 days');

-- ===== INSERT TEAM POSTS =====

INSERT INTO team_posts (id, user_id, content, type, reactions, created_at) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002',
 'Just closed a major settlement! Great work from the entire team. Special thanks to Dr. Lee for the excellent medical coordination!',
 'celebration', '{"😍": 5, "🎉": 8, "👏": 3}', NOW() - INTERVAL '2 days'),

('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001',
 'Reminder: Client satisfaction surveys are due by end of week. Let''s keep our scores high!', 'announcement', '{}', NOW() - INTERVAL '1 day'),

('a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005',
 'Huge shoutout to Jordan Smith for jumping in on the Watson intake at the last minute. Your dedication to our clients is incredible!',
 'shoutout', '{"❤️": 7, "👍": 4}', NOW() - INTERVAL '12 hours'),

('a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003',
 'What''s the biggest challenge you''re facing with your current caseload? Let''s workshop this together.',
 'poll', '{}', NOW() - INTERVAL '6 hours');

-- ===== INSERT NOTIFICATIONS =====

INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES
('b50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002',
 'New Case Assignment', 'You have been assigned case INJ-2024-001 (Robert Johnson)', 'assignment', true, NOW() - INTERVAL '2 hours'),

('b50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002',
 'Urgent Case', 'Case INJ-2024-001 marked as urgent - requires immediate attention', 'alert', true, NOW() - INTERVAL '1.5 hours'),

('b50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003',
 'Checklist Reminder', 'You have pending checklist items for case INJ-2024-002', 'reminder', false, NOW() - INTERVAL '30 minutes'),

('b50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005',
 'Badge Earned!', 'You earned the "First Case" badge!', 'achievement', false, NOW() - INTERVAL '5 minutes'),

('b50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008',
 'Medical Records Requested', 'Medical records have been requested for case INJ-2024-001', 'info', true, NOW() - INTERVAL '3 hours');

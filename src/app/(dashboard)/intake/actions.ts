'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface IntakeInput {
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

export interface IntakeResult {
  ok: boolean
  caseNumber?: string
  caseId?: string
  caseManagerName?: string | null
  error?: string
}

function computeIsMinor(dob: string): boolean {
  if (!dob) return false
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age < 18
}

async function pickCaseManager(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ id: string; full_name: string | null } | null> {
  const { data: managers } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('role', 'case_manager')

  if (!managers || managers.length === 0) return null

  const { data: activeCases } = await supabase
    .from('cases')
    .select('assigned_case_manager_id')
    .neq('stage', 'srl')

  const counts = new Map<string, number>()
  for (const m of managers) counts.set(m.id, 0)
  for (const c of activeCases ?? []) {
    const id = c.assigned_case_manager_id
    if (id && counts.has(id)) counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  let best = managers[0]
  let bestCount = counts.get(best.id) ?? 0
  for (const m of managers) {
    const n = counts.get(m.id) ?? 0
    if (n < bestCount) {
      best = m
      bestCount = n
    }
  }
  return best
}

export async function createCase(input: IntakeInput): Promise<IntakeResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, error: 'Not authenticated' }

  const manager = await pickCaseManager(supabase)

  const missingInsurance = !input.umPolicy && !input.biInfo

  const { data, error } = await supabase
    .from('cases')
    .insert({
      client_name: input.clientName,
      client_phone: input.phone,
      client_dob: input.dob || null,
      date_of_accident: input.dateOfAccident || null,
      state: input.state,
      zip_code: input.zipCode,
      accident_description: input.accidentDescription,
      opposing_party: input.opposingParty || null,
      police_report_number: input.policeReportNumber || null,
      insurance_um_policy: input.umPolicy || null,
      insurance_bi_info: input.biInfo || null,
      stage: 'new_case',
      assigned_case_manager_id: manager?.id ?? null,
      is_minor: computeIsMinor(input.dob),
      has_insurance_warning: missingInsurance,
    })
    .select('id, case_number')
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Failed to create case' }
  }

  revalidatePath('/cases')
  revalidatePath('/dashboard')

  return {
    ok: true,
    caseId: data.id,
    caseNumber: data.case_number,
    caseManagerName: manager?.full_name ?? null,
  }
}

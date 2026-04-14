'use server'

import { revalidatePath } from 'next/cache'
import { getContext } from '@/lib/supabase/testing'

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

export async function createCase(input: IntakeInput): Promise<IntakeResult> {
  const { db } = await getContext()

  const { data: rawManagers } = await db
    .from('users')
    .select('id, full_name')
    .eq('role', 'case_manager')

  const managers = (rawManagers ?? []) as Array<{
    id: string
    full_name: string | null
  }>

  let managerId: string | null = null
  let managerName: string | null = null

  if (managers.length > 0) {
    const { data: rawActive } = await db
      .from('cases')
      .select('assigned_case_manager_id')
      .neq('stage', 'srl')

    const activeCases = (rawActive ?? []) as Array<{
      assigned_case_manager_id: string | null
    }>

    const counts = new Map<string, number>()
    for (const m of managers) counts.set(m.id, 0)
    for (const c of activeCases) {
      const id = c.assigned_case_manager_id
      if (id && counts.has(id)) counts.set(id, (counts.get(id) ?? 0) + 1)
    }

    let bestCount = Infinity
    for (const m of managers) {
      const n = counts.get(m.id) ?? 0
      if (n < bestCount) {
        bestCount = n
        managerId = m.id
        managerName = m.full_name
      }
    }
  }

  const missingInsurance = !input.umPolicy && !input.biInfo

  const { data, error } = await db
    .from('cases')
    .insert([
      {
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
        assigned_case_manager_id: managerId,
        is_minor: computeIsMinor(input.dob),
        has_insurance_warning: missingInsurance,
      },
    ] as never)
    .select('id, case_number')
    .single()

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Failed to create case' }
  }

  revalidatePath('/cases')
  revalidatePath('/dashboard')

  return {
    ok: true,
    caseId: (data as { id: string }).id,
    caseNumber: (data as { case_number: string }).case_number,
    caseManagerName: managerName,
  }
}

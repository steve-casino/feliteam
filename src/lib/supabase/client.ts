import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  if (supabaseClient) return supabaseClient
  supabaseClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return supabaseClient
}

export default getSupabase

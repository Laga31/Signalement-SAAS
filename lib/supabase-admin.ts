import { createClient } from '@supabase/supabase-js'

// Client avec service role — côté serveur uniquement, ne jamais importer côté client
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

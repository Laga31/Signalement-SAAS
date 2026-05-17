import { createClient } from '@/lib/supabase-server'
import SignalementsClient from './SignalementsClient'

export default async function SignalementsPage() {
  const supabase = await createClient()

  const [{ data: signalements }, { data: types }] = await Promise.all([
    supabase
      .from('signalements')
      .select('*, types(id, label, color, icon), profiles(prenom, nom)')
      .order('created_at', { ascending: false }),
    supabase.from('types').select('id, label, color').order('label'),
  ])

  return <SignalementsClient initialData={signalements ?? []} types={types ?? []} />
}

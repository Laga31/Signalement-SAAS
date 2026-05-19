import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import NouveauSignalement from './NouveauSignalement'

export default async function NouveauPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portail/login')

  const { data: types } = await supabase
    .from('types')
    .select('id, label, color, icon')
    .order('label', { ascending: true })

  return (
    <NouveauSignalement
      types={types ?? []}
      userId={user.id}
    />
  )
}

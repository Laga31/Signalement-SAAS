import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import SignalementDetail from './SignalementDetail'

export default async function SignalementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: s } = await supabase
    .from('signalements')
    .select('*, types(id, label, color, icon), profiles(prenom, nom, email)')
    .eq('id', id)
    .single()

  if (!s) notFound()

  const { data: types } = await supabase.from('types').select('id, label, color, icon').order('label')

  return <SignalementDetail signalement={s} types={types ?? []} />
}

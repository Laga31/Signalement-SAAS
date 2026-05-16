import { createClient } from '@/lib/supabase-server'
import TypesClient from './TypesClient'

export default async function TypesPage() {
  const supabase = await createClient()
  const { data: types } = await supabase.from('types').select('*').order('label')
  return <TypesClient initialTypes={types ?? []} />
}

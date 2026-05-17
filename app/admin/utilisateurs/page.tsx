import { createClient } from '@/lib/supabase-server'
import UtilisateursClient from './UtilisateursClient'

export default async function UtilisateursPage() {
  const supabase = await createClient()

  const { data: { user: me } } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, prenom, nom, role, email')
    .order('nom')

  // Récupère les emails depuis auth.users via une vue admin
  // On passe juste les profils pour l'instant (email non dispo côté client sans service role)
  return <UtilisateursClient profiles={profiles ?? []} currentUserId={me?.id ?? ''} />
}

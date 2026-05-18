'use server'

import { createAdminClient } from '@/lib/supabase-admin'

export async function createUser(data: {
  email: string
  password: string
  prenom: string
  nom: string
  role: 'user' | 'admin'
}) {
  const supabase = createAdminClient()

  // Crée l'utilisateur dans auth.users
  const { data: created, error } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true, // pas besoin de validation par email
    user_metadata: { prenom: data.prenom, nom: data.nom },
  })

  if (error) return { error: error.message }

  // Met à jour le rôle si admin (le trigger crée le profil avec role 'user' par défaut)
  if (data.role === 'admin' && created.user) {
    await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', created.user.id)
  }

  return { user: created.user }
}

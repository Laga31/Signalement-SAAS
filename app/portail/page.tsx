import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PortailHome from './PortailHome'

function computeStats(signalements: Array<{ statut: string; created_at: string }>) {
  const total = signalements.length
  const pending = signalements.filter(s => s.statut === 'pending').length

  // perDay: last 7 days
  const now = new Date()
  const perDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    return { date: dateStr, count: 0 }
  })
  for (const s of signalements) {
    const dateStr = s.created_at.split('T')[0]
    const entry = perDay.find(p => p.date === dateStr)
    if (entry) entry.count++
  }

  // avgDuration: average minutes between consecutive signalements (sorted by created_at asc)
  let avgDuration: number | null = null
  if (signalements.length >= 2) {
    const sorted = [...signalements].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    const intervals: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i].created_at).getTime() - new Date(sorted[i - 1].created_at).getTime()) / 60000
      intervals.push(diff)
    }
    avgDuration = intervals.reduce((a, b) => a + b, 0) / intervals.length
  }

  return { total, pending, perDay, avgDuration }
}

export default async function PortailPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portail/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom, nom')
    .eq('id', user.id)
    .single()

  const { data: signalements } = await supabase
    .from('signalements')
    .select('*, types(label, color, icon)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const list = signalements ?? []
  const stats = computeStats(list)
  const prenom = profile?.prenom ?? user.email?.split('@')[0] ?? 'Utilisateur'

  return (
    <PortailHome
      prenom={prenom}
      signalements={list as Parameters<typeof PortailHome>[0]['signalements']}
      stats={stats}
    />
  )
}

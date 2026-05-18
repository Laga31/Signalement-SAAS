import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SignalementsPortail from './SignalementsPortail'

type RawSignalement = {
  id: string
  reference: string
  titre: string
  statut: 'pending' | 'reviewed' | 'closed'
  created_at: string
  types: { label: string; color: string; icon: string } | null
}

function computeStats(signalements: RawSignalement[]) {
  const total = signalements.length
  const pending = signalements.filter(s => s.statut === 'pending').length

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

export default async function SignalementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portail/login')

  const { data: rawList } = await supabase
    .from('signalements')
    .select('id, reference, titre, statut, created_at, types(label, color, icon)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const list: RawSignalement[] = (rawList ?? []) as unknown as RawSignalement[]
  const stats = computeStats(list)

  // Compute intervalMinutes: sorted ascending, interval since previous
  const sorted = [...list].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const intervalMap = new Map<string, number | null>()
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      intervalMap.set(sorted[i].id, null)
    } else {
      const diff = (new Date(sorted[i].created_at).getTime() - new Date(sorted[i - 1].created_at).getTime()) / 60000
      intervalMap.set(sorted[i].id, diff)
    }
  }

  const enriched = list.map(s => ({
    ...s,
    intervalMinutes: intervalMap.get(s.id) ?? null,
  }))

  return (
    <SignalementsPortail
      signalements={enriched}
      stats={{ total: stats.total, pending: stats.pending, avgDuration: stats.avgDuration }}
    />
  )
}

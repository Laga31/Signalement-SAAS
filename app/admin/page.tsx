import { createClient } from '@/lib/supabase-server'

const STATUS_LABEL: Record<string, string> = {
  pending:  'En attente',
  reviewed: 'Examiné',
  closed:   'Clôturé',
}

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  pending:  { background: '#fff4e5', color: '#9a5a00' },
  reviewed: { background: '#e0eafe', color: '#0058bc' },
  closed:   { background: '#e5f4ee', color: '#059669' },
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count: total }, { count: pending }, { data: recents }, { data: types }] = await Promise.all([
    supabase.from('signalements').select('*', { count: 'exact', head: true }),
    supabase.from('signalements').select('*', { count: 'exact', head: true }).eq('statut', 'pending'),
    supabase.from('signalements').select('*, types(label, color, icon), profiles(prenom, nom)').order('created_at', { ascending: false }).limit(5),
    supabase.from('types').select('id, label, color'),
  ])

  const today = recents?.filter(s => s.created_at?.startsWith(new Date().toISOString().slice(0, 10))).length ?? 0

  const kpis = [
    { label: 'Total signalements', value: total ?? 0,   icon: '📥', accent: false },
    { label: "Aujourd'hui",        value: today,          icon: '📅', accent: true  },
    { label: 'En attente',         value: pending ?? 0,  icon: '⏳', accent: false },
    { label: 'Types actifs',       value: types?.length ?? 0, icon: '🏷', accent: false },
  ]

  return (
    <div>
      {/* Titre */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#191c1e', letterSpacing: -0.4 }}>
          Tableau de bord
        </h1>
        <p style={{ margin: '4px 0 0', color: '#717786', fontSize: 14 }}>
          Vue d'ensemble de l'activité
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            background: 'white', borderRadius: 12,
            border: '1px solid rgba(193,198,215,0.5)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            padding: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, fontSize: 18,
                background: k.accent ? '#d8e2ff' : '#f2f4f6',
                display: 'grid', placeItems: 'center',
              }}>{k.icon}</div>
              <div style={{ fontSize: 12, color: '#717786', fontWeight: 500 }}>{k.label}</div>
            </div>
            <div style={{
              fontSize: 32, fontWeight: 700, lineHeight: 1,
              color: k.accent ? '#0058bc' : '#191c1e', letterSpacing: -0.5,
            }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Activité récente */}
      <div style={{
        background: 'white', borderRadius: 12,
        border: '1px solid rgba(193,198,215,0.5)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        padding: 24,
      }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 600, color: '#191c1e' }}>
          Activité récente
        </h3>
        {recents && recents.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f2f4f6', borderBottom: '1px solid #c1c6d7' }}>
                {['Référence', 'Titre', 'Type', 'Statut', 'Auteur', 'Date'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: 12, fontWeight: 600, color: '#717786',
                    textTransform: 'uppercase', letterSpacing: '0.4px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recents.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(193,198,215,0.3)' }}>
                  <td style={{ padding: '14px 16px', fontSize: 12, fontFamily: 'monospace', color: '#717786' }}>
                    {s.reference}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, color: '#191c1e' }}>
                    {s.titre}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.types?.color, flexShrink: 0 }} />
                      {s.types?.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 9999,
                      fontSize: 12, fontWeight: 500,
                      ...STATUS_STYLE[s.statut],
                    }}>
                      {STATUS_LABEL[s.statut]}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#414755' }}>
                    {s.profiles?.prenom} {s.profiles?.nom}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#717786' }}>
                    {new Date(s.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#717786' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            <p style={{ margin: 0, fontSize: 14 }}>Aucun signalement pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
}

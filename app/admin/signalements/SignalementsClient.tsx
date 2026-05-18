'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type Signalement = {
  id: string
  reference: string
  titre: string
  statut: string
  created_at: string
  types: { id: string; label: string; color: string; icon: string } | null
  profiles: { prenom: string; nom: string } | null
}

type TypeRow = { id: string; label: string; color: string }

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

const STATUTS = ['all', 'pending', 'reviewed', 'closed'] as const

export default function SignalementsClient({
  initialData,
  types,
}: {
  initialData: Signalement[]
  types: TypeRow[]
}) {
  const router = useRouter()
  const [search, setSearch]       = useState('')
  const [statut, setStatut]       = useState<string>('all')
  const [typeId, setTypeId]       = useState<string>('all')

  const filtered = useMemo(() => {
    return initialData.filter(s => {
      if (statut !== 'all' && s.statut !== statut) return false
      if (typeId !== 'all' && s.types?.id !== typeId) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !s.titre?.toLowerCase().includes(q) &&
          !s.reference?.toLowerCase().includes(q) &&
          !s.profiles?.prenom?.toLowerCase().includes(q) &&
          !s.profiles?.nom?.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [initialData, statut, typeId, search])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#191c1e', letterSpacing: -0.4 }}>
          Signalements
        </h1>
        <p style={{ margin: '4px 0 0', color: '#717786', fontSize: 14 }}>
          {filtered.length} / {initialData.length} signalement{initialData.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Recherche */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', background: 'white', borderRadius: 10,
          border: '1px solid #c1c6d7', flex: '1 1 220px', maxWidth: 320,
        }}>
          <span style={{ color: '#717786' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Référence, titre, auteur…"
            style={{
              border: 'none', outline: 'none', fontSize: 14,
              fontFamily: 'inherit', background: 'white', width: '100%', color: '#191c1e',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#717786', fontSize: 16, padding: 0 }}>×</button>
          )}
        </div>

        {/* Statut */}
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUTS.map(s => (
            <button
              key={s}
              onClick={() => setStatut(s)}
              style={{
                padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: statut === s ? 600 : 500, fontFamily: 'inherit',
                background: statut === s ? '#0058bc' : 'white',
                color: statut === s ? 'white' : '#414755',
                boxShadow: statut === s ? '0 2px 8px -2px rgba(0,88,188,0.4)' : '0 1px 2px rgba(0,0,0,0.06)',
                border: statut === s ? 'none' : '1px solid rgba(193,198,215,0.5)',
              } as React.CSSProperties}
            >
              {s === 'all' ? 'Tous' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {/* Type */}
        <select
          value={typeId}
          onChange={e => setTypeId(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(193,198,215,0.5)',
            background: 'white', fontSize: 14, fontFamily: 'inherit', color: '#191c1e',
            cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all">Tous les types</option>
          {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: 'white', borderRadius: 12,
        border: '1px solid rgba(193,198,215,0.5)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        overflow: 'hidden',
      }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#717786' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            <p style={{ margin: 0, fontSize: 14 }}>Aucun signalement ne correspond aux filtres</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f2f4f6', borderBottom: '1px solid #c1c6d7' }}>
                {['Référence', 'Titre', 'Type', 'Statut', 'Auteur', 'Date'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: 12, fontWeight: 600, color: '#717786',
                    textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  onClick={() => router.push(`/admin/signalements/${s.id}`)}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(193,198,215,0.3)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f7f9fb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontSize: 12, fontFamily: 'monospace', color: '#717786', whiteSpace: 'nowrap' }}>
                    {s.reference}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 500, color: '#191c1e', maxWidth: 280 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.titre}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    {s.types ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                        <span style={{ fontSize: 16 }}>{s.types.icon}</span>
                        {s.types.label}
                      </span>
                    ) : (
                      <span style={{ color: '#aaa', fontSize: 13 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 9999,
                      fontSize: 12, fontWeight: 500,
                      ...STATUS_STYLE[s.statut],
                    }}>
                      {STATUS_LABEL[s.statut]}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#414755', whiteSpace: 'nowrap' }}>
                    {s.profiles ? `${s.profiles.prenom} ${s.profiles.nom}` : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#717786', whiteSpace: 'nowrap' }}>
                    {new Date(s.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

type Statut = 'pending' | 'reviewed' | 'closed'

type Signalement = {
  id: string
  reference: string
  titre: string
  statut: Statut
  created_at: string
  intervalMinutes: number | null
  types: { label: string; color: string; icon: string } | null
}

type Stats = {
  total: number
  pending: number
  avgDuration: number | null
}

type Props = {
  signalements: Signalement[]
  stats: Stats
}

const STATUT_STYLES: Record<Statut, { label: string; bg: string; color: string }> = {
  pending:  { label: 'En attente', bg: '#fff4e5', color: '#9a5a00' },
  reviewed: { label: 'Examiné',    bg: '#e0eafe', color: '#0058bc' },
  closed:   { label: 'Clôturé',    bg: '#e5f4ee', color: '#059669' },
}

const FILTER_OPTIONS: Array<{ key: string; label: string }> = [
  { key: 'all',      label: 'Tous' },
  { key: 'pending',  label: 'En attente' },
  { key: 'reviewed', label: 'Examiné' },
  { key: 'closed',   label: 'Clôturé' },
]

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}min`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}min`
  return `${Math.floor(minutes / 1440)}j`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function SignalementsPortail({ signalements, stats }: Props) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all'
    ? signalements
    : signalements.filter(s => s.statut === filter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page title */}
      <div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#111827', letterSpacing: -0.4 }}>
          Mes signalements
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b7280' }}>
          Retrouvez ici l&apos;historique de toutes vos déclarations
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: `${stats.total} signalement${stats.total !== 1 ? 's' : ''}`, icon: '📋', color: '#0058bc', bg: '#e0eafe' },
          { label: `${stats.pending} en attente`, icon: '⏳', color: '#9a5a00', bg: '#fff4e5' },
          { label: stats.avgDuration != null ? `Moy. ${formatDuration(stats.avgDuration)}` : 'Durée —', icon: '⏱️', color: '#059669', bg: '#e5f4ee' },
        ].map((chip, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 20,
            background: chip.bg,
            color: chip.color,
            fontSize: 13,
            fontWeight: 600,
          }}>
            <span>{chip.icon}</span>
            <span>{chip.label}</span>
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: filter === opt.key ? 'none' : '1.5px solid #e5e7eb',
              background: filter === opt.key ? '#0058bc' : 'white',
              color: filter === opt.key ? 'white' : '#374151',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'all 0.15s',
              boxShadow: filter === opt.key ? '0 2px 8px rgba(0,88,188,0.3)' : 'none',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Cards list */}
      {filtered.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '60px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ margin: 0, fontSize: 16, color: '#6b7280', fontWeight: 500 }}>
            Aucun signalement {filter !== 'all' ? `avec le statut "${FILTER_OPTIONS.find(f => f.key === filter)?.label}"` : ''}
          </p>
          <a href="/portail/nouveau" style={{
            display: 'inline-block',
            marginTop: 20,
            padding: '10px 20px',
            background: '#0058bc',
            color: 'white',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
          }}>
            + Nouveau signalement
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(s => {
            const statut = STATUT_STYLES[s.statut]
            const typeColor = s.types?.color ?? '#6b7280'
            return (
              <div
                key={s.id}
                style={{
                  background: 'white',
                  borderRadius: 14,
                  padding: '18px 20px',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #f3f4f6',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Type dot/icon */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: typeColor + '18',
                    border: `2px solid ${typeColor}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                  }}>
                    {s.types?.icon ?? '📌'}
                  </div>

                  {/* Center: title + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: '#111827',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {s.titre}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {s.types?.label ?? 'Type inconnu'} · {formatDate(s.created_at)}
                    </div>
                  </div>

                  {/* Right: status badge */}
                  <span style={{
                    padding: '5px 13px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: statut.bg,
                    color: statut.color,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}>
                    {statut.label}
                  </span>
                </div>

                {/* Bottom row: interval */}
                <div style={{
                  fontSize: 11,
                  color: '#9ca3af',
                  paddingLeft: 58,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <span>🕐</span>
                  <span>
                    Intervalle depuis le précédent :{' '}
                    <strong style={{ color: '#6b7280' }}>
                      {s.intervalMinutes != null ? formatDuration(s.intervalMinutes) : '—'}
                    </strong>
                  </span>
                  <span style={{ marginLeft: 12, color: '#d1d5db' }}>·</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{s.reference}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Signalement = {
  id: string
  reference: string
  titre: string
  description: string
  statut: string
  created_at: string
  types: { id: string; label: string; color: string; icon: string } | null
  profiles: { prenom: string; nom: string; email: string } | null
}

type TypeRow = { id: string; label: string; color: string; icon: string }

const STATUS_OPTIONS = [
  { value: 'pending',  label: 'En attente',  bg: '#fff4e5', color: '#9a5a00' },
  { value: 'reviewed', label: 'Examiné',     bg: '#e0eafe', color: '#0058bc' },
  { value: 'closed',   label: 'Clôturé',     bg: '#e5f4ee', color: '#059669' },
]

export default function SignalementDetail({
  signalement: initial,
  types,
}: {
  signalement: Signalement
  types: TypeRow[]
}) {
  const router  = useRouter()
  const supabase = createClient()

  const [statut, setStatut]   = useState(initial.statut)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  const current = STATUS_OPTIONS.find(o => o.value === statut)!

  const handleStatutChange = async (val: string) => {
    setStatut(val)
    setSaving(true); setSaved(false)
    await supabase.from('signalements').update({ statut: val }).eq('id', initial.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: 780 }}>
      {/* Retour */}
      <button
        onClick={() => router.back()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginBottom: 20, border: 'none', background: 'none',
          cursor: 'pointer', color: '#717786', fontSize: 14, fontFamily: 'inherit', padding: 0,
        }}
      >
        ← Retour
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#717786' }}>{initial.reference}</span>
            {initial.types && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#414755' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: initial.types.color, display: 'inline-block' }} />
                {initial.types.label}
              </span>
            )}
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#191c1e', letterSpacing: -0.3 }}>
            {initial.titre}
          </h1>
        </div>

        {/* Statut selector */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <select
              value={statut}
              onChange={e => handleStatutChange(e.target.value)}
              disabled={saving}
              style={{
                appearance: 'none',
                padding: '8px 36px 8px 14px',
                borderRadius: 9999,
                border: 'none',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', outline: 'none',
                background: current.bg, color: current.color,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              fontSize: 10, color: current.color, pointerEvents: 'none',
            }}>▾</span>
          </div>
          {saved && (
            <span style={{ position: 'absolute', top: '110%', right: 0, fontSize: 12, color: '#059669', whiteSpace: 'nowrap' }}>
              ✓ Sauvegardé
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Description */}
        <div style={{
          background: 'white', borderRadius: 12,
          border: '1px solid rgba(193,198,215,0.5)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          padding: 24,
        }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#717786', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Description
          </h3>
          <p style={{ margin: 0, fontSize: 15, color: '#191c1e', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            {initial.description || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Aucune description</span>}
          </p>
        </div>

        {/* Métadonnées */}
        <div style={{
          background: 'white', borderRadius: 12,
          border: '1px solid rgba(193,198,215,0.5)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          padding: 24,
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#717786', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Informations
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
            <MetaRow label="Auteur">
              {initial.profiles
                ? `${initial.profiles.prenom} ${initial.profiles.nom}`
                : '—'}
            </MetaRow>
            <MetaRow label="Email">
              {initial.profiles?.email ?? '—'}
            </MetaRow>
            <MetaRow label="Type">
              {initial.types
                ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span>{initial.types.icon}</span>
                    {initial.types.label}
                  </span>
                )
                : '—'}
            </MetaRow>
            <MetaRow label="Date">
              {new Date(initial.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </MetaRow>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#717786', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#191c1e' }}>{children}</div>
    </div>
  )
}

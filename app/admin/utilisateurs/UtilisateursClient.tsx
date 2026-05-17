'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

type Profile = {
  id: string
  prenom: string
  nom: string
  email?: string
  role: string
}

const ROLE_STYLE: Record<string, { background: string; color: string }> = {
  admin: { background: '#d8e2ff', color: '#0058bc' },
  user:  { background: '#f2f4f6', color: '#414755' },
}

function initiales(p: Profile) {
  return `${p.prenom?.[0] ?? ''}${p.nom?.[0] ?? ''}`.toUpperCase() || '?'
}

export default function UtilisateursClient({
  profiles: initial,
  currentUserId,
}: {
  profiles: Profile[]
  currentUserId: string
}) {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<Profile[]>(initial)
  const [toggling, setToggling] = useState<string | null>(null)
  const [search, setSearch]     = useState('')

  const filtered = profiles.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.prenom?.toLowerCase().includes(q) ||
      p.nom?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    )
  })

  const toggleRole = async (p: Profile) => {
    if (p.id === currentUserId) return
    const newRole = p.role === 'admin' ? 'user' : 'admin'
    setToggling(p.id)
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', p.id)
    if (!error) {
      setProfiles(prev => prev.map(u => u.id === p.id ? { ...u, role: newRole } : u))
    }
    setToggling(null)
  }

  const admins = filtered.filter(p => p.role === 'admin').length
  const users  = filtered.filter(p => p.role === 'user').length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#191c1e', letterSpacing: -0.4 }}>
            Utilisateurs
          </h1>
          <p style={{ margin: '4px 0 0', color: '#717786', fontSize: 14 }}>
            {profiles.length} compte{profiles.length !== 1 ? 's' : ''} · {admins} admin{admins !== 1 ? 's' : ''} · {users} utilisateur{users !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Recherche */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
        padding: '8px 12px', background: 'white', borderRadius: 10,
        border: '1px solid rgba(193,198,215,0.5)',
        maxWidth: 340,
      }}>
        <span style={{ color: '#717786' }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Nom, prénom, email…"
          style={{
            border: 'none', outline: 'none', fontSize: 14,
            fontFamily: 'inherit', background: 'transparent', width: '100%', color: '#191c1e',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#717786', fontSize: 16, padding: 0 }}>×</button>
        )}
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
            <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
            <p style={{ margin: 0, fontSize: 14 }}>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f2f4f6', borderBottom: '1px solid #c1c6d7' }}>
                {['Utilisateur', 'Email', 'Rôle', 'Action'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: 12, fontWeight: 600, color: '#717786',
                    textTransform: 'uppercase', letterSpacing: '0.4px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const isMe = p.id === currentUserId
                const isAdmin = p.role === 'admin'
                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(193,198,215,0.3)' : 'none' }}
                  >
                    {/* Avatar + nom */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: isAdmin ? '#0058bc' : '#717786',
                          color: 'white', display: 'grid', placeItems: 'center',
                          fontSize: 13, fontWeight: 700,
                        }}>
                          {initiales(p)}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#191c1e' }}>
                            {p.prenom} {p.nom}
                            {isMe && (
                              <span style={{ marginLeft: 8, fontSize: 11, color: '#717786', fontWeight: 400 }}>
                                (vous)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#414755' }}>
                      {p.email ?? '—'}
                    </td>

                    {/* Rôle */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 9999,
                        fontSize: 12, fontWeight: 600,
                        ...ROLE_STYLE[p.role] ?? { background: '#f2f4f6', color: '#414755' },
                      }}>
                        {isAdmin ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 16px' }}>
                      {isMe ? (
                        <span style={{ fontSize: 13, color: '#aaa' }}>—</span>
                      ) : (
                        <button
                          onClick={() => toggleRole(p)}
                          disabled={toggling === p.id}
                          style={{
                            padding: '6px 14px', borderRadius: 8,
                            border: `1px solid ${isAdmin ? '#f0a500' : '#0058bc'}`,
                            background: 'white',
                            color: isAdmin ? '#9a5a00' : '#0058bc',
                            fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                            cursor: toggling === p.id ? 'not-allowed' : 'pointer',
                            opacity: toggling === p.id ? 0.5 : 1,
                            transition: 'opacity 0.15s',
                          }}
                        >
                          {toggling === p.id
                            ? '…'
                            : isAdmin
                            ? 'Rétrograder'
                            : 'Promouvoir admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ marginTop: 12, fontSize: 12, color: '#aaa' }}>
        Les comptes sont créés lors de la première connexion. Vous ne pouvez pas modifier votre propre rôle.
      </p>
    </div>
  )
}

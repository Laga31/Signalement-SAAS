'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [pw, setPw]       = useState('')
  const [pw2, setPw2]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone]   = useState(false)
  const router  = useRouter()
  const supabase = createClient()

  const canSubmit = pw.length >= 8 && pw === pw2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true); setError('')
    const { error: updateError } = await supabase.auth.updateUser({ password: pw })
    if (updateError) {
      setError('Une erreur est survenue. Recommencez depuis le mail de récupération.')
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/admin'), 2000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f7f9fb', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 400, padding: '48px 40px',
        background: 'white', borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(193,198,215,0.3)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: '#0058bc', display: 'grid', placeItems: 'center',
            color: 'white', fontSize: 26,
          }}>⚡</div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#191c1e' }}>
              Nouveau mot de passe
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#717786' }}>
              Choisissez un mot de passe sécurisé
            </p>
          </div>
        </div>

        {done ? (
          <div style={{
            padding: '16px', borderRadius: 10, textAlign: 'center',
            background: '#e5f4ee', color: '#059669', fontWeight: 600,
          }}>
            ✓ Mot de passe mis à jour — redirection…
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#717786', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="8 caractères minimum"
                required
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: '1px solid #c1c6d7', fontSize: 15, outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                  color: '#191c1e', background: 'white',
                }}
                onFocus={e => (e.target.style.borderColor = '#0058bc')}
                onBlur={e => (e.target.style.borderColor = '#c1c6d7')}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#717786', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>
                Confirmation
              </label>
              <input
                type="password"
                value={pw2}
                onChange={e => setPw2(e.target.value)}
                placeholder="Répétez le mot de passe"
                required
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: `1px solid ${pw2 && pw !== pw2 ? '#ba1a1a' : '#c1c6d7'}`, fontSize: 15, outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                  color: '#191c1e', background: 'white',
                }}
                onFocus={e => (e.target.style.borderColor = '#0058bc')}
                onBlur={e => (e.target.style.borderColor = pw2 && pw !== pw2 ? '#ba1a1a' : '#c1c6d7')}
              />
              {pw2 && pw !== pw2 && (
                <p style={{ margin: '4px 0 0 4px', fontSize: 12, color: '#ba1a1a' }}>
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#ffdad6', color: '#ba1a1a', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              style={{
                height: 48, background: '#0058bc', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
                cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
                opacity: canSubmit && !loading ? 1 : 0.5,
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Tab = 'login' | 'signup'

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
  const labels = ['Faible', 'Moyen', 'Bon', 'Fort']

  if (!password) return null

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i < score ? colors[score - 1] : '#e2e8f0',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 11, color: score > 0 ? colors[score - 1] : '#94a3b8', fontWeight: 500 }}>
        {score > 0 ? labels[score - 1] : ''}
      </span>
    </div>
  )
}

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  suffix,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  suffix?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: 13,
        fontWeight: 600,
        color: '#374151',
        marginBottom: 6,
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            padding: suffix ? '12px 44px 12px 14px' : '12px 14px',
            borderRadius: 10,
            border: `1.5px solid ${focused ? '#0058bc' : '#d1d5db'}`,
            fontSize: 15,
            outline: 'none',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxSizing: 'border-box',
            color: '#111827',
            background: 'white',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxShadow: focused ? '0 0 0 3px rgba(0,88,188,0.1)' : 'none',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {suffix && (
          <div style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PortailLoginPage() {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    } else {
      router.push('/portail')
    }
  }

  const traduireErreur = (msg: string): string => {
    if (msg.toLowerCase().includes('rate limit')) return 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.'
    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) return 'Cette adresse email est déjà utilisée.'
    if (msg.toLowerCase().includes('invalid email')) return 'Adresse email invalide.'
    if (msg.toLowerCase().includes('weak password')) return 'Mot de passe trop faible. Ajoutez des chiffres ou des caractères spéciaux.'
    if (msg.toLowerCase().includes('network')) return 'Erreur réseau. Vérifiez votre connexion.'
    return 'Une erreur est survenue. Veuillez réessayer.'
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { prenom, nom } },
    })
    if (error) {
      setError(traduireErreur(error.message))
      setLoading(false)
    } else {
      router.push('/portail')
    }
  }

  const showHideButton = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#6b7280',
        fontSize: 18,
        padding: 4,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {show ? '🙈' : '👁'}
    </button>
  )

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(160deg, #e8f0fe 0%, #f0f4fa 50%, #e0eafe 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '24px 16px',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'fixed',
        top: -120,
        right: -120,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,88,188,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        bottom: -80,
        left: -80,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,88,188,0.15), 0 4px 20px rgba(0,0,0,0.08)',
      }}>
        {/* Gradient Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0058bc 0%, #3b82f6 100%)',
          padding: '36px 40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}>⚡</div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'white', letterSpacing: -0.4 }}>
              Signalement
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
              Votre espace personnel
            </p>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: 4,
            gap: 4,
            marginTop: 4,
          }}>
            {(['login', 'signup'] as Tab[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError('') }}
                style={{
                  padding: '8px 20px',
                  borderRadius: 7,
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'all 0.2s',
                  background: tab === t ? 'white' : 'transparent',
                  color: tab === t ? '#0058bc' : 'rgba(255,255,255,0.85)',
                  boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                {t === 'login' ? 'Connexion' : 'Créer un compte'}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '32px 40px 36px' }}>
          {tab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <InputField
                label="Adresse email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="vous@exemple.fr"
                required
              />
              <InputField
                label="Mot de passe"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                required
                suffix={showHideButton(showPw, () => setShowPw(s => !s))}
              />

              {error && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: 13,
                  fontWeight: 500,
                  border: '1px solid #fecaca',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 50,
                  background: 'linear-gradient(135deg, #0058bc 0%, #1a6fd4 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  boxShadow: '0 4px 16px -2px rgba(0,88,188,0.4)',
                  transition: 'opacity 0.15s, transform 0.1s',
                  marginTop: 4,
                }}
              >
                {loading ? 'Connexion en cours…' : 'Se connecter →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <InputField
                    label="Prénom"
                    type="text"
                    value={prenom}
                    onChange={setPrenom}
                    placeholder="Marie"
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <InputField
                    label="Nom"
                    type="text"
                    value={nom}
                    onChange={setNom}
                    placeholder="Dupont"
                    required
                  />
                </div>
              </div>
              <InputField
                label="Adresse email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="vous@exemple.fr"
                required
              />
              <div>
                <InputField
                  label="Mot de passe"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="Minimum 8 caractères"
                  required
                  suffix={showHideButton(showPw, () => setShowPw(s => !s))}
                />
                <PasswordStrength password={password} />
              </div>
              <InputField
                label="Confirmer le mot de passe"
                type={showConfirmPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="••••••••"
                required
                suffix={showHideButton(showConfirmPw, () => setShowConfirmPw(s => !s))}
              />

              {error && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: 13,
                  fontWeight: 500,
                  border: '1px solid #fecaca',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 50,
                  background: 'linear-gradient(135deg, #0058bc 0%, #1a6fd4 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  boxShadow: '0 4px 16px -2px rgba(0,88,188,0.4)',
                  transition: 'opacity 0.15s',
                  marginTop: 4,
                }}
              >
                {loading ? 'Création du compte…' : 'Créer mon compte →'}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 24, marginBottom: 0 }}>
            En continuant, vous acceptez nos conditions d&apos;utilisation.
          </p>
        </div>
      </div>
    </div>
  )
}

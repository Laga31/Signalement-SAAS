'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// Affiche l'icône : emoji si c'est un emoji, initiale du label sinon
function TypeIcon({ icon, label, color }: { icon: string; label: string; color: string }) {
  const isEmoji = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(icon)
  if (isEmoji) {
    return <span style={{ fontSize: 24 }}>{icon}</span>
  }
  return (
    <span style={{ fontSize: 18, fontWeight: 700, color }}>
      {label?.[0]?.toUpperCase() ?? '?'}
    </span>
  )
}

type TypeOption = {
  id: string
  label: string
  color: string
  icon: string
}

type Props = {
  types: TypeOption[]
  userId: string
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: step < total ? 1 : 'none' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: done ? '#0058bc' : active ? '#0058bc' : '#e5e7eb',
              color: done || active ? 'white' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: active ? '0 0 0 4px rgba(0,88,188,0.15)' : 'none',
              transition: 'all 0.2s',
            }}>
              {done ? '✓' : step}
            </div>
            {step < total && (
              <div style={{
                flex: 1,
                height: 2,
                background: done ? '#0058bc' : '#e5e7eb',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      padding: '14px 20px',
      background: '#065f46',
      color: 'white',
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 600,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      zIndex: 9999,
      animation: 'slideIn 0.3s ease',
    }}>
      <span>✅</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontSize: 16,
          padding: '0 0 0 8px',
        }}
      >×</button>
    </div>
  )
}

export default function NouveauSignalement({ types, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState('')

  const selectedType = types.find(t => t.id === selectedTypeId)

  const handleSubmit = async () => {
    if (!selectedTypeId || !selectedType) return
    setLoading(true)
    setError('')

    const year = new Date().getFullYear()
    const reference = `SIG-${year}-${Date.now().toString().slice(-5)}`

    const { error: insertError } = await supabase.from('signalements').insert({
      reference,
      titre: selectedType.label,
      description: description.trim() || null,
      type_id: selectedTypeId,
      statut: 'pending',
      user_id: userId,
    })

    if (insertError) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
      return
    }

    setToast('Signalement créé avec succès !')
    setTimeout(() => {
      router.push('/portail/signalements')
    }, 1800)
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#111827', letterSpacing: -0.4 }}>
          Nouveau signalement
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6b7280' }}>
          Signalez un problème en quelques étapes
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '36px 40px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
      }}>
        <StepIndicator current={step} total={3} />

        {/* Step 1: Type selection */}
        {step === 1 && (
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: '#111827' }}>
              Quel type de signalement ?
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280' }}>
              Choisissez la catégorie qui correspond le mieux à votre situation.
            </p>

            {types.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: 40 }}>⚠️</div>
                <p style={{ margin: '12px 0 0' }}>Aucun type disponible pour le moment.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 12,
              }}>
                {types.map(t => {
                  const selected = selectedTypeId === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTypeId(t.id)}
                      style={{
                        padding: '20px 16px',
                        borderRadius: 14,
                        border: selected ? `2px solid ${t.color}` : '2px solid #e5e7eb',
                        background: selected ? t.color + '12' : 'white',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        transition: 'all 0.15s',
                        boxShadow: selected ? `0 4px 16px ${t.color}30` : '0 1px 4px rgba(0,0,0,0.05)',
                        transform: selected ? 'translateY(-2px)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: t.color + '20',
                        border: `1.5px solid ${t.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                      }}>
                        <TypeIcon icon={t.icon} label={t.label} color={t.color} />
                      </div>
                      <span style={{
                        fontSize: 13,
                        fontWeight: selected ? 700 : 600,
                        color: selected ? t.color : '#374151',
                        lineHeight: 1.3,
                      }}>
                        {t.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={!selectedTypeId}
                onClick={() => setStep(2)}
                style={{
                  padding: '12px 28px',
                  background: selectedTypeId ? '#0058bc' : '#e5e7eb',
                  color: selectedTypeId ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: selectedTypeId ? 'pointer' : 'not-allowed',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  boxShadow: selectedTypeId ? '0 4px 12px rgba(0,88,188,0.3)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: '#111827' }}>
              Décrivez votre signalement
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280' }}>
              Donnez-nous plus de détails pour mieux traiter votre demande.
            </p>

            {/* Selected type reminder */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 10,
              background: (selectedType?.color ?? '#0058bc') + '12',
              border: `1.5px solid ${selectedType?.color ?? '#0058bc'}30`,
              marginBottom: 20,
            }}>
              {selectedType && <TypeIcon icon={selectedType.icon} label={selectedType.label} color={selectedType.color} />}
              <span style={{ fontSize: 13, fontWeight: 600, color: selectedType?.color ?? '#0058bc' }}>
                {selectedType?.label}
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Description (optionnelle)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Décrivez le problème, son emplacement, le contexte…"
                rows={5}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #d1d5db',
                  fontSize: 14,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  color: '#111827',
                  lineHeight: 1.6,
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#0058bc')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')}
              />
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' }}>
                {description.length} caractère{description.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#374151',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                style={{
                  padding: '12px 28px',
                  background: '#0058bc',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  boxShadow: '0 4px 12px rgba(0,88,188,0.3)',
                }}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: '#111827' }}>
              Confirmer et envoyer
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: 14, color: '#6b7280' }}>
              Vérifiez les informations avant d&apos;envoyer votre signalement.
            </p>

            {/* Summary card */}
            <div style={{
              borderRadius: 14,
              border: '1.5px solid #e5e7eb',
              overflow: 'hidden',
              marginBottom: 24,
            }}>
              <div style={{
                padding: '16px 20px',
                background: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: (selectedType?.color ?? '#0058bc') + '18',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {selectedType && <TypeIcon icon={selectedType.icon} label={selectedType.label} color={selectedType.color} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{selectedType?.label}</div>
                  <span style={{
                    fontSize: 11,
                    padding: '3px 10px',
                    borderRadius: 12,
                    background: '#fff4e5',
                    color: '#9a5a00',
                    fontWeight: 600,
                  }}>
                    En attente
                  </span>
                </div>
              </div>

              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
                  Description
                </div>
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  color: description ? '#374151' : '#9ca3af',
                  fontStyle: description ? 'normal' : 'italic',
                  lineHeight: 1.6,
                }}>
                  {description || 'Aucune description fournie.'}
                </p>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: '#fef2f2',
                color: '#dc2626',
                fontSize: 13,
                fontWeight: 500,
                border: '1px solid #fecaca',
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#374151',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: '12px 32px',
                  background: loading ? '#6b7280' : 'linear-gradient(135deg, #0058bc 0%, #1a6fd4 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(0,88,188,0.35)',
                  transition: 'all 0.15s',
                }}
              >
                {loading ? '⏳ Envoi en cours…' : '✅ Envoyer le signalement'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

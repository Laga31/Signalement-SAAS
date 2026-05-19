'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

type TypeRow = { id: string; label: string; color: string; icon: string }

const PRESET_COLORS = [
  '#0058bc', '#7c3aed', '#dc2626', '#d97706', '#059669',
  '#0891b2', '#db2777', '#65a30d', '#9a3412', '#475569',
]

const PRESET_ICONS = [
  '🚨', '🔧', '💡', '🌿', '🚧', '🔒', '💧', '🗑️',
  '🚗', '📢', '⚡', '🏗️', '🏠', '🌊', '🌳', '🐛',
  '🔥', '❄️', '🦺', '📍', '🛑', '⚠️', '🏥', '🎯',
]

const EMPTY: Omit<TypeRow, 'id'> = { label: '', color: '#0058bc', icon: '🚨' }

export default function TypesClient({ initialTypes }: { initialTypes: TypeRow[] }) {
  const [types, setTypes]         = useState<TypeRow[]>(initialTypes)
  const [modal, setModal]         = useState<'create' | 'edit' | null>(null)
  const [form, setForm]           = useState<Omit<TypeRow, 'id'>>(EMPTY)
  const [editId, setEditId]       = useState<string | null>(null)
  const [customIcon, setCustomIcon] = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [confirmDelete, setConfirmDelete] = useState<TypeRow | null>(null)
  const [deleteError, setDeleteError]     = useState('')
  const [deleting, setDeleting]           = useState(false)
  const supabase = createClient()

  const openCreate = () => {
    setForm(EMPTY)
    setEditId(null)
    setError('')
    setCustomIcon('')
    setModal('create')
  }

  const openEdit = (t: TypeRow) => {
    setForm({ label: t.label, color: t.color, icon: t.icon })
    setEditId(t.id)
    setError('')
    setCustomIcon('')
    setModal('edit')
  }

  const closeModal = () => { setModal(null); setEditId(null) }

  const handleSave = async () => {
    if (!form.label.trim()) { setError('Le libellé est requis.'); return }
    setSaving(true); setError('')

    if (modal === 'create') {
      const { data, error: e } = await supabase.from('types').insert(form).select().single()
      if (e) { setError(e.message); setSaving(false); return }
      setTypes(prev => [...prev, data].sort((a, b) => a.label.localeCompare(b.label)))
    } else {
      const { error: e } = await supabase.from('types').update(form).eq('id', editId!)
      if (e) { setError(e.message); setSaving(false); return }
      setTypes(prev => prev.map(t => t.id === editId ? { ...t, ...form } : t))
    }

    setSaving(false)
    closeModal()
  }

  const askDelete = (t: TypeRow) => {
    setDeleteError('')
    setConfirmDelete(t)
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    setDeleteError('')

    const { error: e } = await supabase.from('types').delete().eq('id', confirmDelete.id)

    if (e) {
      // FK violation = type encore utilisé par des signalements
      const msg = e.code === '23503'
        ? 'Ce type est encore utilisé par des signalements. Supprimez ou réaffectez ces signalements d\'abord.'
        : e.message
      setDeleteError(msg)
      setDeleting(false)
      return
    }

    setTypes(prev => prev.filter(t => t.id !== confirmDelete.id))
    setDeleting(false)
    setConfirmDelete(null)
  }

  const setIcon = (ic: string) => setForm(f => ({ ...f, icon: ic }))

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#191c1e', letterSpacing: -0.4 }}>
            Types de signalement
          </h1>
          <p style={{ margin: '4px 0 0', color: '#717786', fontSize: 14 }}>
            {types.length} type{types.length !== 1 ? 's' : ''} configuré{types.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10,
            background: '#0058bc', color: 'white',
            border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
            boxShadow: '0 4px 12px -2px rgba(0,88,188,0.35)',
          }}
        >
          <span style={{ fontSize: 18 }}>+</span>
          Nouveau type
        </button>
      </div>

      {/* Grid */}
      {types.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 12,
          border: '1px solid rgba(193,198,215,0.5)',
          padding: '60px 0', textAlign: 'center', color: '#717786',
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏷️</div>
          <p style={{ margin: 0, fontSize: 14 }}>Aucun type pour le moment</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {types.map(t => (
            <div key={t.id} style={{
              background: 'white', borderRadius: 12,
              border: '1px solid rgba(193,198,215,0.5)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              padding: 20,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: t.color + '20',
                border: `2px solid ${t.color}40`,
                display: 'grid', placeItems: 'center', fontSize: 22,
              }}>{t.icon}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#191c1e', marginBottom: 4 }}>
                  {t.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: '#717786', fontFamily: 'monospace' }}>{t.color}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => openEdit(t)}
                  title="Modifier"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, fontSize: 16, color: '#717786' }}
                >✏️</button>
                <button
                  onClick={() => askDelete(t)}
                  title="Supprimer"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, fontSize: 16, color: '#717786' }}
                >🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal créer / éditer ── */}
      {modal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: '#191c1e' }}>
              {modal === 'create' ? 'Nouveau type' : 'Modifier le type'}
            </h2>

            {/* Preview */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
              padding: '12px 16px', borderRadius: 10, background: '#f7f9fb',
              border: '1px solid rgba(193,198,215,0.5)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: form.color + '20', border: `2px solid ${form.color}40`,
                display: 'grid', placeItems: 'center', fontSize: 22,
              }}>{form.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#191c1e' }}>
                  {form.label || <span style={{ color: '#aaa' }}>Libellé…</span>}
                </div>
                <div style={{ fontSize: 12, color: '#717786', fontFamily: 'monospace' }}>{form.color}</div>
              </div>
            </div>

            {/* Libellé */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#717786', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>
                Libellé
              </label>
              <input
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="Ex : Voirie, Éclairage…"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #c1c6d7', fontSize: 14, fontFamily: 'inherit',
                  outline: 'none', boxSizing: 'border-box',
                  color: '#191c1e', background: 'white',
                }}
                onFocus={e => (e.target.style.borderColor = '#0058bc')}
                onBlur={e => (e.target.style.borderColor = '#c1c6d7')}
              />
            </div>

            {/* Icônes preset */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#717786', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>
                Icône
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {PRESET_ICONS.map(ic => (
                  <button
                    key={ic}
                    onClick={() => { setIcon(ic); setCustomIcon('') }}
                    style={{
                      width: 38, height: 38, borderRadius: 8, fontSize: 19,
                      border: form.icon === ic ? `2px solid ${form.color}` : '1px solid #c1c6d7',
                      background: form.icon === ic ? form.color + '15' : 'white',
                      cursor: 'pointer',
                    }}
                  >{ic}</button>
                ))}
              </div>
              {/* Emoji personnalisé */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  value={customIcon}
                  onChange={e => {
                    setCustomIcon(e.target.value)
                    if (e.target.value) setIcon(e.target.value)
                  }}
                  placeholder="Ou colle un emoji personnalisé…"
                  maxLength={8}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #c1c6d7', fontSize: 18, fontFamily: 'inherit',
                    outline: 'none', color: '#191c1e', background: 'white',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#0058bc')}
                  onBlur={e => (e.target.style.borderColor = '#c1c6d7')}
                />
              </div>
            </div>

            {/* Couleur */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#717786', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>
                Couleur
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                      cursor: 'pointer', outline: form.color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: 2,
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #c1c6d7', cursor: 'pointer', padding: 0, background: 'none' }}
                  title="Couleur personnalisée"
                />
              </div>
            </div>

            {error && (
              <div style={{ padding: '8px 12px', borderRadius: 8, background: '#ffdad6', color: '#ba1a1a', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: '1px solid #c1c6d7',
                  background: 'white', color: '#414755', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >Annuler</button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none',
                  background: '#0058bc', color: 'white', fontSize: 14, fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  opacity: saving ? 0.7 : 1,
                }}
              >{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmation suppression ── */}
      {confirmDelete && (
        <div
          onClick={() => { if (!deleting) setConfirmDelete(null) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 16 }}>⚠️</div>
            <h2 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700, color: '#191c1e', textAlign: 'center' }}>
              Supprimer ce type ?
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#717786', textAlign: 'center' }}>
              Le type <strong style={{ color: '#191c1e' }}>{confirmDelete.label}</strong> sera définitivement supprimé.
              Cette action est irréversible.
            </p>

            {deleteError && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: '#fef2f2', color: '#dc2626',
                fontSize: 13, fontWeight: 500,
                border: '1px solid #fecaca', marginBottom: 16,
              }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: '1px solid #c1c6d7',
                  background: 'white', color: '#414755', fontSize: 14, fontWeight: 500,
                  cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  opacity: deleting ? 0.6 : 1,
                }}
              >Annuler</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: '#dc2626', color: 'white', fontSize: 14, fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  opacity: deleting ? 0.7 : 1,
                }}
              >{deleting ? 'Suppression…' : 'Supprimer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

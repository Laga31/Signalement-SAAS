'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const NAV = [
  { id: 'dashboard',    href: '/admin',                icon: '⊞', label: 'Tableau de bord' },
  { id: 'signalements', href: '/admin/signalements',   icon: '📥', label: 'Signalements' },
  { id: 'types',        href: '/admin/types',           icon: '🏷', label: 'Types' },
  { id: 'utilisateurs', href: '/admin/utilisateurs',    icon: '👥', label: 'Utilisateurs' },
]

export default function AdminSidebar({ user }: { user: { email: string, prenom?: string, nom?: string } }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initiales = `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase()

  return (
    <aside style={{
      width: 240, flexShrink: 0, background: 'white',
      borderRight: '1px solid rgba(193,198,215,0.5)',
      display: 'flex', flexDirection: 'column', padding: '20px 14px',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '4px 10px 20px', borderBottom: '1px solid rgba(193,198,215,0.4)', marginBottom: 14,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: '#0058bc', color: 'white',
          display: 'grid', placeItems: 'center', fontSize: 16,
        }}>⚡</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0058bc', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Signalement
          </div>
          <div style={{ fontSize: 11, color: '#717786' }}>Console admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(n => {
          const isActive = n.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(n.href)
          return (
            <button
              key={n.id}
              onClick={() => router.push(n.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 8,
                background: isActive ? '#d8e2ff' : 'transparent',
                color: isActive ? '#0058bc' : '#414755',
                border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                fontSize: 14, fontWeight: isActive ? 600 : 500,
                fontFamily: 'inherit', transition: 'background 0.12s',
              }}
            >
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </button>
          )
        })}
      </nav>

      {/* User footer */}
      <div style={{
        padding: '12px 10px', borderTop: '1px solid rgba(193,198,215,0.4)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#0058bc', color: 'white',
          display: 'grid', placeItems: 'center',
          fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>{initiales}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.prenom} {user.nom}
          </div>
          <div style={{ fontSize: 11, color: '#717786' }}>Admin</div>
        </div>
        <button
          onClick={handleLogout}
          title="Se déconnecter"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#717786', fontSize: 16, padding: 6, borderRadius: 6,
          }}
        >⎋</button>
      </div>
    </aside>
  )
}

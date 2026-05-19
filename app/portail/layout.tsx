import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function PortailLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portail/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const prenom = profile?.prenom ?? user.email?.split('@')[0] ?? 'Utilisateur'
  const nom = profile?.nom ?? ''
  const initials = `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4fa', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Navigation Bar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'linear-gradient(135deg, #0058bc 0%, #1a6fd4 100%)',
        boxShadow: '0 2px 20px rgba(0,88,188,0.25)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
        }}>
          {/* Logo */}
          <a href="/portail" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: 'white',
            flexShrink: 0,
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              backdropFilter: 'blur(4px)',
            }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.3 }}>Signalement</span>
          </a>

          {/* Nav Links */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}>
            {[
              { href: '/portail', label: 'Accueil' },
              { href: '/portail/signalements', label: 'Mes signalements' },
              { href: '/portail/nouveau', label: 'Nouveau' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  transition: 'all 0.15s',
                  background: link.href === '/portail/nouveau'
                    ? 'rgba(255,255,255,0.2)'
                    : 'transparent',
                }}
              >
                {link.href === '/portail/nouveau' ? '+ ' : ''}{link.label}
              </a>
            ))}
          </div>

          {/* User area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: 'white',
                border: '2px solid rgba(255,255,255,0.4)',
              }}>
                {initials || '?'}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 500 }}>
                {prenom}
              </span>
            </div>
            <LogoutButton redirectTo="/portail/login" />
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}

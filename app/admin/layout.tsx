import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f7f9fb' }}>
      <AdminSidebar user={{ email: user.email!, ...profile }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          height: 56, background: 'white', borderBottom: '1px solid #c1c6d7',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14, flexShrink: 0,
        }}>
          <div style={{
            flex: 1, maxWidth: 460, display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', background: '#f2f4f6', borderRadius: 10,
            color: '#717786',
          }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <span style={{ fontSize: 13 }}>Rechercher un signalement, un utilisateur…</span>
            <kbd style={{
              fontSize: 11, padding: '1px 6px', background: 'white', borderRadius: 4,
              border: '1px solid #c1c6d7', color: '#717786', fontFamily: 'inherit', marginLeft: 'auto',
            }}>⌘K</kbd>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#0058bc', color: 'white',
            display: 'grid', placeItems: 'center',
            fontSize: 13, fontWeight: 700,
          }}>
            {profile?.prenom?.[0]}{profile?.nom?.[0]}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 32 }}>
          {children}
        </main>
      </div>
    </div>
  )
}

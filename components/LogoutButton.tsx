'use client'

import { createClient } from '@/lib/supabase'

export default function LogoutButton({ redirectTo = '/login' }: { redirectTo?: string }) {
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Full page reload pour que les cookies soient bien nettoyés
    window.location.href = redirectTo
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '7px 16px',
        background: 'rgba(255,255,255,0.15)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'Inter, system-ui, sans-serif',
        backdropFilter: 'blur(4px)',
        transition: 'background 0.15s',
      }}
    >
      Déconnexion
    </button>
  )
}

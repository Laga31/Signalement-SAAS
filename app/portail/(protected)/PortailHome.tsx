'use client'

type Signalement = {
  id: string
  reference: string
  titre: string
  description: string | null
  statut: 'pending' | 'reviewed' | 'closed'
  created_at: string
  types: { label: string; color: string; icon: string } | null
}

type PerDay = { date: string; count: number }

type Props = {
  prenom: string
  signalements: Signalement[]
  stats: {
    total: number
    pending: number
    perDay: PerDay[]
    avgDuration: number | null
  }
}

const STATUT_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  pending:  { label: 'En attente', bg: '#fff4e5', color: '#9a5a00' },
  reviewed: { label: 'Examiné',    bg: '#e0eafe', color: '#0058bc' },
  closed:   { label: 'Clôturé',    bg: '#e5f4ee', color: '#059669' },
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}min`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}min`
  return `${Math.floor(minutes / 1440)}j`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function KpiCard({
  icon,
  label,
  value,
  gradient,
  sub,
}: {
  icon: string
  label: string
  value: string | number
  gradient: string
  sub?: string
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: '24px 28px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      flex: 1,
      minWidth: 180,
    }}>
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: -0.5 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

function BarChart({ data }: { data: PerDay[] }) {
  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: '28px 32px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 600, color: '#111827' }}>
        Activité — 7 derniers jours
      </h2>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
        {data.map((d, i) => {
          const barH = Math.max(4, (d.count / max) * 100)
          const dayLabel = new Date(d.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' })
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {d.count > 0 && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#0058bc' }}>{d.count}</span>
              )}
              {d.count === 0 && <span style={{ fontSize: 11, color: 'transparent' }}>0</span>}
              <div style={{
                width: '100%',
                height: `${barH}%`,
                background: d.count > 0
                  ? 'linear-gradient(180deg, #3b82f6 0%, #0058bc 100%)'
                  : '#e5e7eb',
                borderRadius: '6px 6px 0 0',
                transition: 'height 0.3s',
                minHeight: 4,
              }} />
              <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>
                {dayLabel}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PortailHome({ prenom, signalements, stats }: Props) {
  const last5 = signalements.slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, #0058bc 0%, #3b82f6 100%)',
        borderRadius: 20,
        padding: '32px 36px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0,88,188,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          right: -30,
          top: -30,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
        }} />
        <div style={{
          position: 'absolute',
          right: 60,
          bottom: -40,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
          Bonjour, {prenom} 👋
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>
          Bienvenue sur votre espace signalement. Suivez vos déclarations en temps réel.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <KpiCard
          icon="📋"
          label="Total signalements"
          value={stats.total}
          gradient="linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
        />
        <KpiCard
          icon="⏳"
          label="En attente"
          value={stats.pending}
          gradient="linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)"
          sub={stats.total > 0 ? `${Math.round((stats.pending / stats.total) * 100)}% du total` : undefined}
        />
        <KpiCard
          icon="⏱️"
          label="Durée moy. entre signalements"
          value={stats.avgDuration != null ? formatDuration(stats.avgDuration) : '—'}
          gradient="linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
          sub="Fréquence de signalement"
        />
      </div>

      {/* Bar Chart */}
      <BarChart data={stats.perDay} />

      {/* Last 5 signalements */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '28px 32px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>
            Mes derniers signalements
          </h2>
          <a href="/portail/signalements" style={{
            fontSize: 13,
            color: '#0058bc',
            textDecoration: 'none',
            fontWeight: 500,
          }}>
            Voir tout →
          </a>
        </div>

        {last5.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9ca3af',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ margin: 0, fontSize: 15 }}>Aucun signalement pour le moment.</p>
            <a href="/portail/nouveau" style={{
              display: 'inline-block',
              marginTop: 16,
              padding: '10px 20px',
              background: '#0058bc',
              color: 'white',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
            }}>
              Créer mon premier signalement
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {last5.map(s => {
              const statut = STATUT_STYLES[s.statut] ?? STATUT_STYLES.pending
              const typeColor = s.types?.color ?? '#6b7280'
              return (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    borderRadius: 12,
                    background: '#f9fafb',
                    border: '1px solid #f3f4f6',
                    transition: 'box-shadow 0.15s',
                  }}
                >
                  {/* Type icon */}
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: typeColor + '20',
                    border: `2px solid ${typeColor}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}>
                    {s.types?.icon ?? '📌'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.titre}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {s.types?.label ?? 'Type inconnu'} · {formatDate(s.created_at)}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: statut.bg,
                    color: statut.color,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}>
                    {statut.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

import { CheckCircleIcon, PackageIcon, TruckBadgeIcon, XIcon } from './icons'

type Status = 'pending' | 'paid' | 'shipped' | 'cancelled'

const STEPS: { key: Status; label: string; Icon: any }[] = [
  { key: 'pending', label: 'Commande reçue', Icon: PackageIcon },
  { key: 'paid', label: 'Paiement confirmé', Icon: CheckCircleIcon },
  { key: 'shipped', label: 'Expédiée', Icon: TruckBadgeIcon },
]

export default function OrderTimeline({ status }: { status: Status }) {
  if (status === 'cancelled') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', color: 'var(--danger-text)', fontSize: 12.5, fontWeight: 700 }}>
        <XIcon size={14} /> Commande annulée
      </div>
    )
  }

  const activeIndex = STEPS.findIndex((s) => s.key === status)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 4px 4px' }}>
      {STEPS.map((s, i) => {
        const done = i <= activeIndex
        const isLast = i === STEPS.length - 1
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: isLast ? '0 0 auto' : 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 64 }}>
              <div
                style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? 'var(--accent)' : 'var(--chip-bg)',
                  color: done ? '#0a0a0a' : 'var(--muted)',
                  transition: 'background 0.25s ease',
                }}
              >
                <s.Icon size={14} />
              </div>
              <span style={{ fontSize: 10.5, color: done ? 'var(--text)' : 'var(--muted)', fontWeight: done ? 700 : 500, textAlign: 'center', lineHeight: 1.3 }}>
                {s.label}
              </span>
            </div>
            {!isLast && (
              <div style={{ flex: 1, height: 2, background: i < activeIndex ? 'var(--accent)' : 'var(--chip-bg)', marginTop: -16, transition: 'background 0.25s ease' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

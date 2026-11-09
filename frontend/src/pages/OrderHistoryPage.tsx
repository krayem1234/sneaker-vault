import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { apiFetch } from '../lib/api'
import { PackageIcon } from '../components/icons'
import OrderTimeline from '../components/OrderTimeline'

export default function OrderHistoryPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[] | null>(null)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    apiFetch('/orders/mine', token).then(setOrders).catch(() => setOrders([]))
  }, [token])

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 64px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>Mes commandes</h1>

      {orders === null ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0, 1].map((i) => <div key={i} className="skeleton" style={{ height: 90 }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card-surface" style={{ padding: 32, textAlign: 'center' }}>
          <PackageIcon size={24} />
          <p style={{ color: 'var(--muted)', marginTop: 10 }}>Aucune commande pour l'instant.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map((o) => (
            <div key={o.id} className="card-surface" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>#{o.id.slice(-8).toUpperCase()}</div>
                <span className="badge" style={{
                  background: o.status === 'shipped' ? 'rgba(99,102,241,0.15)' : o.status === 'paid' ? 'rgba(52,211,153,0.15)' : o.status === 'cancelled' ? 'var(--danger-bg)' : 'var(--chip-bg)',
                  color: o.status === 'shipped' ? '#818cf8' : o.status === 'paid' ? 'var(--green)' : o.status === 'cancelled' ? 'var(--danger-text)' : 'var(--muted)',
                }}>
                  {o.status === 'shipped' ? 'Expédiée' : o.status === 'paid' ? 'Payée' : o.status === 'cancelled' ? 'Annulée' : 'En attente'}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>
                {new Date(o.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <OrderTimeline status={o.status} />
              {o.items.map((it: any) => (
                <div key={it.id} style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span style={{ color: 'var(--muted)' }}>{it.product.name} — taille {it.variant.size} × {it.quantity}</span>
                </div>
              ))}
              <div style={{ textAlign: 'right', fontWeight: 800, marginTop: 8 }}>{(o.totalCents / 100).toFixed(2)} €</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

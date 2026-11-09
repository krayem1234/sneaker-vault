import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useCart } from '../lib/cart'
import { CheckCircleIcon } from '../components/icons'

export default function OrderSuccessPage() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id') || ''
  const { clear } = useCart()
  const [order, setOrder] = useState<any | null>(null)
  const [error, setError] = useState('')
  const clearedRef = { current: false }

  useEffect(() => {
    if (!sessionId) { setError('Session de paiement introuvable'); return }
    apiFetch(`/orders/confirm?session_id=${encodeURIComponent(sessionId)}`, null)
      .then((o) => { setOrder(o); if (!clearedRef.current) { clear(); clearedRef.current = true } })
      .catch((err) => setError(err.message))
  }, [sessionId])

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger-text)' }}>{error}</p>
        <Link to="/shop" className="btn-ghost" style={{ display: 'inline-block', marginTop: 12 }}>Retour à la boutique</Link>
      </div>
    )
  }

  if (!order) {
    return <div style={{ maxWidth: 480, margin: '0 auto', padding: '64px 24px' }}><div className="skeleton" style={{ height: 200 }} /></div>
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
        <CheckCircleIcon size={28} />
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>Commande confirmée</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
        Commande <strong style={{ color: 'var(--text)' }}>#{order.id.slice(-8).toUpperCase()}</strong> — {(order.totalCents / 100).toFixed(2)} €.
        Un email de confirmation a été envoyé à {order.email}.
      </p>

      <div className="card-surface" style={{ padding: 16, textAlign: 'left', marginBottom: 24 }}>
        {order.items.map((it: any) => (
          <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '6px 0' }}>
            <span>{it.product.name} — taille {it.variant.size} × {it.quantity}</span>
            <span style={{ fontWeight: 700 }}>{((it.unitPriceCents * it.quantity) / 100).toFixed(2)} €</span>
          </div>
        ))}
      </div>

      <Link to="/shop" className="btn-primary" style={{ display: 'inline-block' }}>Continuer mes achats</Link>
    </div>
  )
}

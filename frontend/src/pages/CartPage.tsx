import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { apiFetch } from '../lib/api'
import { useToast } from '../lib/toast'
import { TrashIcon, BagIcon } from '../components/icons'

export default function CartPage() {
  const { items, updateQty, remove, totalCents } = useCart()
  const { token, user } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)

  async function checkout() {
    const checkoutEmail = user?.email || email
    if (!checkoutEmail.trim()) { toast.show('Entre ton email', 'error'); return }
    setLoading(true)
    try {
      const res = await apiFetch('/orders/checkout', token, {
        method: 'POST',
        body: JSON.stringify({
          email: checkoutEmail,
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        }),
      })
      window.location.href = res.url
    } catch (err: any) {
      toast.show(err.message, 'error')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <BagIcon size={24} />
        </div>
        <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>Ton panier est vide</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Trouve ta prochaine paire dans la boutique.</p>
        <Link to="/shop" className="btn-primary" style={{ display: 'inline-block' }}>Voir la boutique</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 64px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>Panier</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {items.map((i) => (
          <div key={i.variantId} className="card-surface" style={{ display: 'flex', gap: 14, padding: 12, alignItems: 'center' }}>
            <img src={i.image} alt={i.name} style={{ width: 70, height: 70, borderRadius: 10, objectFit: 'cover' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{i.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Taille {i.size}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 4 }}>{(i.priceCents / 100).toFixed(2)} €</div>
            </div>
            <div className="qty-stepper">
              <button onClick={() => updateQty(i.variantId, i.quantity - 1)}>−</button>
              <span>{i.quantity}</span>
              <button onClick={() => updateQty(i.variantId, i.quantity + 1)} disabled={i.quantity >= i.maxStock}>+</button>
            </div>
            <button className="icon-btn" onClick={() => remove(i.variantId)} title="Retirer">
              <TrashIcon size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="card-surface" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, marginBottom: 16 }}>
          <span>Total</span>
          <span>{(totalCents / 100).toFixed(2)} €</span>
        </div>

        {!user && (
          <input
            className="input"
            type="email"
            placeholder="Ton email (pour la confirmation)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: 12 }}
          />
        )}

        <button className="btn-primary" style={{ width: '100%' }} onClick={checkout} disabled={loading}>
          {loading ? 'Redirection...' : 'Payer avec Stripe'}
        </button>
        <p style={{ fontSize: 11.5, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>
          Paiement en mode test — carte 4242 4242 4242 4242, date future, CVC au choix.
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { apiFetch } from '../lib/api'
import { useToast } from '../lib/toast'
import { TrashIcon, BagIcon, TagIcon } from '../components/icons'
import PaymentOverlay from '../components/PaymentOverlay'

export default function CartPage() {
  const { items, updateQty, remove, totalCents } = useCart()
  const { token, user } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<{ code: string; percentOff: number } | null>(null)
  const [checkingPromo, setCheckingPromo] = useState(false)

  const discountCents = promo ? Math.round((totalCents * promo.percentOff) / 100) : 0
  const finalCents = totalCents - discountCents

  async function applyPromo() {
    if (!promoInput.trim()) return
    setCheckingPromo(true)
    try {
      const res = await apiFetch(`/promo-codes/validate/${encodeURIComponent(promoInput.trim())}`, null)
      setPromo(res)
      toast.show(`Code appliqué : -${res.percentOff}%`, 'success')
    } catch (err: any) {
      setPromo(null)
      toast.show(err.message, 'error')
    } finally {
      setCheckingPromo(false)
    }
  }

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
          ...(promo ? { promoCode: promo.code } : {}),
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
        {loading && <PaymentOverlay />}
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
      {loading && <PaymentOverlay />}
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
              <TagIcon size={14} />
            </span>
            <input
              className="input"
              placeholder="Code promo"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
          <button className="btn-ghost" onClick={applyPromo} disabled={checkingPromo} style={{ padding: '0 18px' }}>
            {checkingPromo ? '...' : 'Appliquer'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>
          <span>Sous-total</span>
          <span>{(totalCents / 100).toFixed(2)} €</span>
        </div>
        {promo && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--green)', marginBottom: 6 }}>
            <span>Réduction ({promo.code} −{promo.percentOff}%)</span>
            <span>−{(discountCents / 100).toFixed(2)} €</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, marginBottom: 16, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
          <span>Total</span>
          <span>{(finalCents / 100).toFixed(2)} €</span>
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

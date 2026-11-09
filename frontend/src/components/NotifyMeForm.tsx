import { useState } from 'react'
import { apiFetch } from '../lib/api'
import { BellIcon } from './icons'

export default function NotifyMeForm({ productId, size, defaultEmail }: { productId: string; size: string; defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail || '')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      await apiFetch(`/products/${productId}/notify-me`, null, {
        method: 'POST',
        body: JSON.stringify({ size, email }),
      })
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Erreur, réessaie')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{ fontSize: 12.5, color: 'var(--success-text, #1a7f4f)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <BellIcon size={14} /> On t'écrit dès que la taille {size} revient en stock.
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
        <BellIcon size={13} /> Taille {size} épuisée — préviens-moi quand elle revient :
      </div>
      <input
        className="input"
        type="email"
        required
        placeholder="ton@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ flex: 1, minWidth: 180, fontSize: 13, padding: '8px 10px' }}
      />
      <button className="btn-ghost" type="submit" disabled={loading} style={{ fontSize: 12.5, padding: '8px 14px' }}>
        {loading ? '...' : 'M\'alerter'}
      </button>
      {error && <div style={{ fontSize: 12, color: 'var(--danger-text)', width: '100%' }}>{error}</div>}
    </form>
  )
}

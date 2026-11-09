import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { MailIcon } from '../components/icons'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiFetch('/auth/forgot-password', null, { method: 'POST', body: JSON.stringify({ email }) })
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 66px)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card-surface slide-up" style={{ width: 380, padding: 32 }}>
        {sent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MailIcon size={20} />
            </div>
            <h1 style={{ fontSize: 19, margin: 0 }}>Vérifie ta boîte mail</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
              Si un compte existe pour <strong style={{ color: 'var(--text)' }}>{email}</strong>, un lien de réinitialisation vient d'être envoyé.
            </p>
            <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none', marginTop: 6, textAlign: 'center' }}>Retour à la connexion</Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 20, margin: '4px 0 2px' }}>Mot de passe oublié</h1>
              <p style={{ color: 'var(--muted)', margin: 0, fontSize: 13.5 }}>Indique ton email, on t'envoie un lien.</p>
            </div>
            <input className="input" type="email" placeholder="toi@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error && (
              <div style={{ color: 'var(--danger-text)', fontSize: 13, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 8, padding: '8px 10px' }}>
                {error}
              </div>
            )}
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer le lien'}</button>
            <Link to="/login" style={{ fontSize: 13, color: 'var(--accent)' }}>← Retour à la connexion</Link>
          </form>
        )}
      </div>
    </div>
  )
}

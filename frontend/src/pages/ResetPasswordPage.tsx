import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useToast } from '../lib/toast'
import { LockIcon } from '../components/icons'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Les deux mots de passe ne correspondent pas'); return }
    if (!token) { setError('Lien invalide'); return }
    setLoading(true)
    try {
      await apiFetch('/auth/reset-password', null, { method: 'POST', body: JSON.stringify({ token, password }) })
      toast.show('Mot de passe mis à jour', 'success')
      navigate('/login')
    } catch (err: any) {
      setError(err.message || 'Lien invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 66px)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <form onSubmit={submit} className="card-surface slide-up" style={{ width: 380, padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LockIcon size={18} />
          </div>
          <h1 style={{ fontSize: 19, margin: 0 }}>Nouveau mot de passe</h1>
        </div>
        {!token && (
          <div style={{ color: 'var(--danger-text)', fontSize: 13, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 8, padding: '8px 10px' }}>
            Aucun jeton trouvé — ouvre le lien reçu par email.
          </div>
        )}
        <input className="input" type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <input className="input" type="password" placeholder="Confirmer" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
        {error && (
          <div style={{ color: 'var(--danger-text)', fontSize: 13, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 8, padding: '8px 10px' }}>
            {error}
          </div>
        )}
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Réinitialiser'}</button>
        <Link to="/login" style={{ fontSize: 13, color: 'var(--accent)' }}>← Retour à la connexion</Link>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { apiFetch } from '../lib/api'
import { useToast } from '../lib/toast'
import ConfirmDialog from '../components/ConfirmDialog'
import { UserIcon, LockIcon, TrashIcon, PlusIcon, PencilIcon, CheckCircleIcon } from '../components/icons'

type Address = {
  id: string; label: string; fullName: string; line1: string; line2?: string | null
  city: string; zip: string; country: string; isDefault: boolean
}

const emptyForm = { label: 'Domicile', fullName: '', line1: '', line2: '', city: '', zip: '', country: 'Tunisie', isDefault: false }

export default function ProfilePage() {
  const { token, user, updateUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const [addresses, setAddresses] = useState<Address[] | null>(null)
  const [form, setForm] = useState<any>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [toDelete, setToDelete] = useState<Address | null>(null)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    loadAddresses()
  }, [token])

  function loadAddresses() {
    apiFetch('/addresses', token).then(setAddresses).catch(() => setAddresses([]))
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await apiFetch('/auth/me', token, { method: 'PATCH', body: JSON.stringify({ name, email }) })
      updateUser(res.token, res.user)
      toast.show('Profil mis à jour', 'success')
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setSavingPassword(true)
    try {
      await apiFetch('/auth/me/password', token, { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }) })
      toast.show('Mot de passe changé', 'success')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  function startEditAddress(a: Address) {
    setEditingId(a.id)
    setForm({ label: a.label, fullName: a.fullName, line1: a.line1, line2: a.line2 || '', city: a.city, zip: a.zip, country: a.country, isDefault: a.isDefault })
    setShowForm(true)
  }

  function startNewAddress() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  async function submitAddress(e: React.FormEvent) {
    e.preventDefault()
    setSavingAddress(true)
    try {
      if (editingId) {
        await apiFetch(`/addresses/${editingId}`, token, { method: 'PATCH', body: JSON.stringify(form) })
        toast.show('Adresse mise à jour', 'success')
      } else {
        await apiFetch('/addresses', token, { method: 'POST', body: JSON.stringify(form) })
        toast.show('Adresse ajoutée', 'success')
      }
      setShowForm(false)
      loadAddresses()
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setSavingAddress(false)
    }
  }

  async function deleteAddress() {
    if (!toDelete) return
    try {
      await apiFetch(`/addresses/${toDelete.id}`, token, { method: 'DELETE' })
      toast.show('Adresse supprimée', 'success')
      loadAddresses()
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setToDelete(null)
    }
  }

  async function makeDefault(a: Address) {
    try {
      await apiFetch(`/addresses/${a.id}`, token, { method: 'PATCH', body: JSON.stringify({ isDefault: true }) })
      loadAddresses()
    } catch (err: any) {
      toast.show(err.message, 'error')
    }
  }

  if (!user) return null

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px 64px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <UserIcon size={20} /> Mon compte
      </h1>

      <form onSubmit={saveProfile} className="card-surface" style={{ padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 style={{ fontSize: 15, margin: 0, fontWeight: 800 }}>Informations personnelles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>NOM</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>EMAIL</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
        <button className="btn-primary" type="submit" disabled={savingProfile} style={{ alignSelf: 'flex-start' }}>
          {savingProfile ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>

      <form onSubmit={savePassword} className="card-surface" style={{ padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 style={{ fontSize: 15, margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <LockIcon size={15} /> Mot de passe
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>ACTUEL</label>
            <input className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required minLength={6} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>NOUVEAU</label>
            <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
          </div>
        </div>
        <button className="btn-primary" type="submit" disabled={savingPassword} style={{ alignSelf: 'flex-start' }}>
          {savingPassword ? 'Changement...' : 'Changer le mot de passe'}
        </button>
      </form>

      <div className="card-surface" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, margin: 0, fontWeight: 800 }}>Adresses de livraison</h2>
          {!showForm && (
            <button className="btn-ghost" onClick={startNewAddress} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
              <PlusIcon size={12} /> Ajouter
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={submitAddress} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18, padding: 14, border: '1px solid var(--line)', borderRadius: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input className="input" placeholder="Libellé (Domicile, Bureau...)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              <input className="input" placeholder="Nom complet" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <input className="input" placeholder="Adresse" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
            <input className="input" placeholder="Complément (optionnel)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <input className="input" placeholder="Ville" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              <input className="input" placeholder="Code postal" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} required />
              <input className="input" placeholder="Pays" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
              Adresse par défaut
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" type="submit" disabled={savingAddress}>
                {savingAddress ? 'Enregistrement...' : editingId ? 'Enregistrer' : 'Ajouter'}
              </button>
              <button className="btn-ghost" type="button" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        )}

        {addresses === null ? (
          <div className="skeleton" style={{ height: 80 }} />
        ) : addresses.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Aucune adresse enregistrée.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {addresses.map((a) => (
              <div key={a.id} className="card-surface" style={{ padding: 14, background: 'var(--surface-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13.5 }}>{a.label}</span>
                      {a.isDefault && (
                        <span className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <CheckCircleIcon size={10} /> Par défaut
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{a.fullName}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{a.zip} {a.city}, {a.country}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="icon-btn" onClick={() => startEditAddress(a)} title="Modifier"><PencilIcon size={14} /></button>
                    <button className="icon-btn" onClick={() => setToDelete(a)} title="Supprimer"><TrashIcon size={14} /></button>
                  </div>
                </div>
                {!a.isDefault && (
                  <button className="btn-ghost" onClick={() => makeDefault(a)} style={{ fontSize: 11.5, padding: '4px 10px', marginTop: 8 }}>
                    Définir par défaut
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Supprimer cette adresse ?"
        message={toDelete ? `L'adresse "${toDelete.label}" sera définitivement supprimée.` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={deleteAddress}
      />
    </div>
  )
}

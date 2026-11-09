import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { apiFetch, API_URL } from '../lib/api'
import { useToast } from '../lib/toast'
import Select from '../components/Select'
import ConfirmDialog from '../components/ConfirmDialog'
import SalesChart from '../components/SalesChart'
import { TrashIcon, PlusIcon, PencilIcon, ChartIcon, DownloadIcon, UploadIcon, TagIcon, TruckBadgeIcon, PackageIcon, XIcon } from '../components/icons'

const SIZES = ['39', '40', '41', '42', '43', '44', '45']

type Category = { id: string; name: string; slug: string }
type Variant = { id: string; size: string; stock: number }
type Product = {
  id: string; name: string; slug: string; description: string; priceCents: number
  images: string[]; featured: boolean; category: Category; variants: Variant[]
}
type Order = {
  id: string; email: string; status: string; totalCents: number; discountCents?: number; promoCode?: string | null; createdAt: string
  user?: { name: string; email: string } | null
  items: { id: string; quantity: number; unitPriceCents: number; product: { name: string }; variant: { size: string } }[]
}
type Promo = { id: string; code: string; percentOff: number; active: boolean; expiresAt: string | null }

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState<'products' | 'orders' | 'categories' | 'promos' | 'stats'>('products')
  const [products, setProducts] = useState<Product[] | null>(null)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [promos, setPromos] = useState<Promo[] | null>(null)
  const [toDelete, setToDelete] = useState<Product | null>(null)
  const [catToDelete, setCatToDelete] = useState<Category | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [image1, setImage1] = useState('')
  const [image2, setImage2] = useState('')
  const [uploading1, setUploading1] = useState(false)
  const [uploading2, setUploading2] = useState(false)
  const [csvImporting, setCsvImporting] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [featured, setFeatured] = useState(false)
  const [stocks, setStocks] = useState<Record<string, string>>(Object.fromEntries(SIZES.map((s) => [s, '5'])))
  const [saving, setSaving] = useState(false)

  const [newCatName, setNewCatName] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')
  const [editCatSlug, setEditCatSlug] = useState('')

  const [newPromoCode, setNewPromoCode] = useState('')
  const [newPromoPercent, setNewPromoPercent] = useState('10')
  const [newPromoExpires, setNewPromoExpires] = useState('')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    if (user && user.role !== 'admin') { navigate('/'); return }
  }, [token, user])

  function loadProducts() {
    apiFetch('/products/admin/all', token).then(setProducts).catch(() => setProducts([]))
  }
  function loadOrders() {
    apiFetch('/orders', token).then(setOrders).catch(() => setOrders([]))
  }
  function loadCategories() {
    apiFetch('/categories', null).then((cats) => { setCategories(cats); if (cats[0] && !categoryId) setCategoryId(cats[0].id) })
  }
  function loadPromos() {
    apiFetch('/promo-codes', token).then(setPromos).catch(() => setPromos([]))
  }

  useEffect(() => {
    if (!token || user?.role !== 'admin') return
    loadCategories()
    loadProducts()
    loadOrders()
    loadPromos()
  }, [token, user])

  function resetForm() {
    setEditingId(null)
    setName(''); setDescription(''); setPrice(''); setImage1(''); setImage2(''); setFeatured(false)
    setStocks(Object.fromEntries(SIZES.map((s) => [s, '5'])))
    if (categories[0]) setCategoryId(categories[0].id)
  }

  function startEdit(p: Product) {
    setEditingId(p.id)
    setName(p.name)
    setDescription(p.description)
    setPrice((p.priceCents / 100).toFixed(2))
    setCategoryId(p.category.id)
    setImage1(p.images[0] || '')
    setImage2(p.images[1] || '')
    setFeatured(p.featured)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submitProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !categoryId || !price) { toast.show('Remplis au moins nom, prix et catégorie', 'error'); return }
    setSaving(true)
    try {
      if (editingId) {
        await apiFetch(`/products/${editingId}`, token, {
          method: 'PATCH',
          body: JSON.stringify({
            name,
            description: description || `${name} — confort et style au quotidien.`,
            priceCents: Math.round(parseFloat(price) * 100),
            images: [image1, image2].filter(Boolean),
            categoryId,
            featured,
          }),
        })
        toast.show('Produit modifié', 'success')
      } else {
        await apiFetch('/products', token, {
          method: 'POST',
          body: JSON.stringify({
            name,
            slug: slugify(name),
            description: description || `${name} — confort et style au quotidien.`,
            priceCents: Math.round(parseFloat(price) * 100),
            images: [image1, image2].filter(Boolean),
            categoryId,
            featured,
            sizes: SIZES.map((s) => ({ size: s, stock: parseInt(stocks[s] || '0', 10) || 0 })),
          }),
        })
        toast.show('Produit créé', 'success')
      }
      resetForm()
      loadProducts()
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function uploadImage(file: File, slot: 1 | 2) {
    const setUploading = slot === 1 ? setUploading1 : setUploading2
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_URL}/products/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || "Échec de l'upload")
      }
      const data = await res.json()
      const fullUrl = `${API_URL}${data.url}`
      if (slot === 1) setImage1(fullUrl)
      else setImage2(fullUrl)
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  async function updateStock(productId: string, variantId: string, stock: number) {
    try {
      await apiFetch(`/products/${productId}/variants/${variantId}`, token, { method: 'PATCH', body: JSON.stringify({ stock }) })
      loadProducts()
    } catch (err: any) {
      toast.show(err.message, 'error')
    }
  }

  async function deleteProduct() {
    if (!toDelete) return
    try {
      await apiFetch(`/products/${toDelete.id}`, token, { method: 'DELETE' })
      toast.show('Produit supprimé', 'success')
      if (editingId === toDelete.id) resetForm()
      loadProducts()
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setToDelete(null)
    }
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return
    try {
      await apiFetch('/categories', token, {
        method: 'POST',
        body: JSON.stringify({ name: newCatName, slug: newCatSlug || slugify(newCatName) }),
      })
      toast.show('Catégorie créée', 'success')
      setNewCatName(''); setNewCatSlug('')
      loadCategories()
    } catch (err: any) {
      toast.show(err.message, 'error')
    }
  }

  function startEditCat(c: Category) {
    setEditingCatId(c.id)
    setEditCatName(c.name)
    setEditCatSlug(c.slug)
  }

  async function saveEditCat(id: string) {
    try {
      await apiFetch(`/categories/${id}`, token, { method: 'PATCH', body: JSON.stringify({ name: editCatName, slug: editCatSlug }) })
      toast.show('Catégorie modifiée', 'success')
      setEditingCatId(null)
      loadCategories()
    } catch (err: any) {
      toast.show(err.message, 'error')
    }
  }

  async function deleteCategory() {
    if (!catToDelete) return
    try {
      await apiFetch(`/categories/${catToDelete.id}`, token, { method: 'DELETE' })
      toast.show('Catégorie supprimée', 'success')
      loadCategories()
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setCatToDelete(null)
    }
  }

  async function createPromo(e: React.FormEvent) {
    e.preventDefault()
    if (!newPromoCode.trim() || !newPromoPercent) return
    try {
      await apiFetch('/promo-codes', token, {
        method: 'POST',
        body: JSON.stringify({
          code: newPromoCode,
          percentOff: parseInt(newPromoPercent, 10),
          ...(newPromoExpires ? { expiresAt: new Date(newPromoExpires).toISOString() } : {}),
        }),
      })
      toast.show('Code promo créé', 'success')
      setNewPromoCode(''); setNewPromoPercent('10'); setNewPromoExpires('')
      loadPromos()
    } catch (err: any) {
      toast.show(err.message, 'error')
    }
  }

  async function togglePromo(p: Promo) {
    try {
      await apiFetch(`/promo-codes/${p.id}`, token, { method: 'PATCH', body: JSON.stringify({ active: !p.active }) })
      loadPromos()
    } catch (err: any) {
      toast.show(err.message, 'error')
    }
  }

  async function deletePromo(p: Promo) {
    try {
      await apiFetch(`/promo-codes/${p.id}`, token, { method: 'DELETE' })
      loadPromos()
    } catch (err: any) {
      toast.show(err.message, 'error')
    }
  }

  async function downloadOrdersCsv() {
    try {
      const res = await fetch(`${API_URL}/orders/export.csv`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error("Échec de l'export")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'commandes.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      toast.show(err.message, 'error')
    }
  }

  async function downloadProductsCsv() {
    try {
      const res = await fetch(`${API_URL}/products/export.csv`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error("Échec de l'export")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'produits.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      toast.show(err.message, 'error')
    }
  }

  async function importStockCsv(file: File) {
    setCsvImporting(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_URL}/products/import-stock`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) throw new Error("Échec de l'import")
      const result = await res.json()
      toast.show(`${result.updated} ligne(s) mise(s) à jour${result.errors?.length ? `, ${result.errors.length} erreur(s)` : ''}`, result.errors?.length ? 'error' : 'success')
      loadProducts()
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setCsvImporting(false)
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    setUpdatingOrderId(orderId)
    try {
      await apiFetch(`/orders/${orderId}/status`, token, { method: 'PATCH', body: JSON.stringify({ status }) })
      setOrders((prev) => prev ? prev.map((o) => o.id === orderId ? { ...o, status } : o) : prev)
      toast.show('Statut mis à jour', 'success')
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const stats = useMemo(() => {
    if (!orders) return null
    const paid = orders.filter((o) => o.status === 'paid')
    const pending = orders.filter((o) => o.status === 'pending')
    const totalCents = paid.reduce((sum, o) => sum + o.totalCents, 0)
    const avgCents = paid.length ? Math.round(totalCents / paid.length) : 0
    const qtyByProduct = new Map<string, number>()
    for (const o of paid) {
      for (const it of o.items) {
        qtyByProduct.set(it.product.name, (qtyByProduct.get(it.product.name) || 0) + it.quantity)
      }
    }
    const topProducts = [...qtyByProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    const lowStock = (products || [])
      .flatMap((p) => p.variants.filter((v) => v.stock <= 2).map((v) => ({ product: p.name, size: v.size, stock: v.stock })))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 8)
    return { paidCount: paid.length, pendingCount: pending.length, totalCents, avgCents, topProducts, lowStock }
  }, [orders, products])

  if (!token || user?.role !== 'admin') return null

  const tabs: { id: typeof tab; label: string; icon?: boolean }[] = [
    { id: 'products', label: 'Produits' },
    { id: 'orders', label: 'Commandes' },
    { id: 'categories', label: 'Catégories' },
    { id: 'promos', label: 'Codes promo' },
    { id: 'stats', label: 'Stats' },
  ]

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 64px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 18px' }}>Admin</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className="btn-ghost"
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: tab === t.id ? 'var(--accent)' : undefined,
              color: tab === t.id ? '#fff' : undefined,
              borderColor: tab === t.id ? 'var(--accent)' : undefined,
            }}
          >
            {t.id === 'stats' && <ChartIcon size={13} />}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <>
          <form onSubmit={submitProduct} className="card-surface" style={{ padding: 20, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 15, margin: 0, fontWeight: 800 }}>{editingId ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              {editingId && (
                <button type="button" className="btn-ghost" onClick={resetForm} style={{ padding: '4px 10px', fontSize: 12 }}>Annuler</button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <input className="input" placeholder="Nom du produit" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="input" placeholder="Prix (€)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <textarea className="input" placeholder="Description (optionnel)" value={description} onChange={(e) => setDescription(e.target.value)} />

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>IMAGES</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {([1, 2] as const).map((slot) => {
                  const value = slot === 1 ? image1 : image2
                  const isUploading = slot === 1 ? uploading1 : uploading2
                  return (
                    <label
                      key={slot}
                      className="card-surface"
                      style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderStyle: 'dashed' }}
                    >
                      {value ? (
                        <img src={value} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UploadIcon size={15} />
                        </div>
                      )}
                      <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                        {isUploading ? 'Envoi...' : value ? 'Remplacer' : `Image ${slot}${slot === 2 ? ' (optionnel)' : ''}`}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, slot) }}
                      />
                    </label>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' }}>
              <Select value={categoryId} onChange={setCategoryId} options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="Catégorie" />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Mettre en vedette
              </label>
            </div>
            {!editingId && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>STOCK PAR POINTURE</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SIZES.map((s) => (
                    <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{s}</span>
                      <input
                        className="input"
                        type="number"
                        min={0}
                        style={{ width: 52, padding: '6px 8px', textAlign: 'center' }}
                        value={stocks[s]}
                        onChange={(e) => setStocks((s2) => ({ ...s2, [s]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {editingId && (
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                Le stock par pointure se modifie directement dans la liste ci-dessous.
              </p>
            )}
            <button className="btn-primary" type="submit" disabled={saving || uploading1 || uploading2} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6 }}>
              {!editingId && <PlusIcon size={13} />} {saving ? 'Enregistrement...' : editingId ? 'Enregistrer les modifications' : 'Créer le produit'}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <button className="btn-ghost" onClick={downloadProductsCsv} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <DownloadIcon size={13} /> Exporter en CSV
            </button>
            <label className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <UploadIcon size={13} /> {csvImporting ? 'Import...' : 'Importer le stock (CSV)'}
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                disabled={csvImporting}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) importStockCsv(f); e.target.value = '' }}
              />
            </label>
          </div>

          {products === null ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {products.map((p) => (
                <div key={p.id} className="card-surface" style={{ padding: 16, outline: editingId === p.id ? '2px solid var(--accent)' : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <img src={p.images[0]} alt="" style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}{p.featured ? ' ⭐' : ''}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.category.name} — {(p.priceCents / 100).toFixed(2)} €</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="icon-btn" onClick={() => startEdit(p)}><PencilIcon size={14} /></button>
                      <button className="icon-btn danger" onClick={() => setToDelete(p)}><TrashIcon size={14} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    {p.variants.map((v) => (
                      <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--chip-bg)', borderRadius: 8, padding: '4px 6px' }}>
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>{v.size}</span>
                        <input
                          type="number"
                          min={0}
                          defaultValue={v.stock}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value, 10) || 0
                            if (val !== v.stock) updateStock(p.id, v.id, val)
                          }}
                          style={{ width: 40, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 12.5, fontWeight: 700 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button className="btn-ghost" onClick={downloadOrdersCsv} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <DownloadIcon size={13} /> Exporter en CSV
            </button>
          </div>
          {orders === null ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : orders.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Aucune commande.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {orders.map((o) => (
                <div key={o.id} className="card-surface" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>#{o.id.slice(-8).toUpperCase()} — {o.email}</div>
                    <span className="badge" style={{ background: o.status === 'paid' ? 'rgba(52,211,153,0.15)' : 'var(--chip-bg)', color: o.status === 'paid' ? 'var(--green)' : 'var(--muted)' }}>
                      {o.status === 'paid' ? 'Payée' : o.status === 'cancelled' ? 'Annulée' : 'En attente'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                    {new Date(o.createdAt).toLocaleString('fr-FR')}
                    {o.promoCode && ` · code ${o.promoCode}`}
                  </div>
                  {o.items.map((it) => (
                    <div key={it.id} style={{ fontSize: 12.5, color: 'var(--muted)' }}>{it.product.name} — taille {it.variant.size} × {it.quantity}</div>
                  ))}
                  <div style={{ textAlign: 'right', fontWeight: 800, marginTop: 6 }}>{(o.totalCents / 100).toFixed(2)} €</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                    {(['pending', 'paid', 'shipped', 'cancelled'] as const).map((s) => (
                      <button
                        key={s}
                        disabled={updatingOrderId === o.id || o.status === s}
                        onClick={() => updateOrderStatus(o.id, s)}
                        className="btn-ghost"
                        style={{
                          fontSize: 11, padding: '5px 10px',
                          borderColor: o.status === s ? 'var(--accent)' : undefined,
                          color: o.status === s ? 'var(--accent)' : undefined,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        {s === 'shipped' && <TruckBadgeIcon size={11} />}
                        {s === 'pending' && <PackageIcon size={11} />}
                        {s === 'cancelled' && <XIcon size={11} />}
                        {s === 'pending' ? 'En attente' : s === 'paid' ? 'Payée' : s === 'shipped' ? 'Expédiée' : 'Annulée'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'categories' && (
        <div>
          <form onSubmit={createCategory} className="card-surface" style={{ padding: 18, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="input" placeholder="Nom (ex. Trail)" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
            <input className="input" placeholder="Slug (auto si vide)" value={newCatSlug} onChange={(e) => setNewCatSlug(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
            <button className="btn-primary" type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PlusIcon size={13} /> Ajouter
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categories.map((c) => (
              <div key={c.id} className="card-surface" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                {editingCatId === c.id ? (
                  <>
                    <input className="input" value={editCatName} onChange={(e) => setEditCatName(e.target.value)} style={{ flex: 1 }} />
                    <input className="input" value={editCatSlug} onChange={(e) => setEditCatSlug(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn-ghost" onClick={() => saveEditCat(c.id)} style={{ padding: '6px 12px', fontSize: 12.5 }}>Enregistrer</button>
                    <button className="btn-ghost" onClick={() => setEditingCatId(null)} style={{ padding: '6px 12px', fontSize: 12.5 }}>Annuler</button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>/{c.slug}</div>
                    </div>
                    <button className="icon-btn" onClick={() => startEditCat(c)}><PencilIcon size={14} /></button>
                    <button className="icon-btn danger" onClick={() => setCatToDelete(c)}><TrashIcon size={14} /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'promos' && (
        <div>
          <form onSubmit={createPromo} className="card-surface" style={{ padding: 18, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="input" placeholder="Code (ex. SNEAKER10)" value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())} style={{ flex: 2, minWidth: 140 }} />
            <input className="input" type="number" min={1} max={90} placeholder="% réduction" value={newPromoPercent} onChange={(e) => setNewPromoPercent(e.target.value)} style={{ flex: 1, minWidth: 100 }} />
            <input className="input" type="date" value={newPromoExpires} onChange={(e) => setNewPromoExpires(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
            <button className="btn-primary" type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PlusIcon size={13} /> Créer
            </button>
          </form>

          {promos === null ? (
            <div className="skeleton" style={{ height: 120 }} />
          ) : promos.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Aucun code promo pour l'instant.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {promos.map((p) => (
                <div key={p.id} className="card-surface" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TagIcon size={16} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 13.5 }}>{p.code} — {p.percentOff}%</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                      {p.expiresAt ? `Expire le ${new Date(p.expiresAt).toLocaleDateString('fr-FR')}` : 'Sans expiration'}
                    </div>
                  </div>
                  <span className="badge" style={{ background: p.active ? 'rgba(52,211,153,0.15)' : 'var(--chip-bg)', color: p.active ? 'var(--green)' : 'var(--muted)' }}>
                    {p.active ? 'Actif' : 'Inactif'}
                  </span>
                  <button className="btn-ghost" onClick={() => togglePromo(p)} style={{ padding: '6px 12px', fontSize: 12 }}>
                    {p.active ? 'Désactiver' : 'Activer'}
                  </button>
                  <button className="icon-btn danger" onClick={() => deletePromo(p)}><TrashIcon size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div>
          {!stats ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                <div className="card-surface" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 6 }}>CHIFFRE D'AFFAIRES</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{(stats.totalCents / 100).toFixed(2)} €</div>
                </div>
                <div className="card-surface" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 6 }}>COMMANDES PAYÉES</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{stats.paidCount}</div>
                </div>
                <div className="card-surface" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 6 }}>EN ATTENTE</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{stats.pendingCount}</div>
                </div>
                <div className="card-surface" style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 6 }}>PANIER MOYEN</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{(stats.avgCents / 100).toFixed(2)} €</div>
                </div>
              </div>

              <div className="card-surface" style={{ padding: 18, marginBottom: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, margin: '0 0 14px' }}>Revenus — 14 derniers jours</h3>
                <SalesChart orders={orders || []} days={14} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                <div className="card-surface" style={{ padding: 18 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, margin: '0 0 12px' }}>Meilleures ventes</h3>
                  {stats.topProducts.length === 0 ? (
                    <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0 }}>Aucune vente pour le moment.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {stats.topProducts.map(([pname, qty]) => (
                        <div key={pname} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span>{pname}</span>
                          <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{qty} vendu{qty > 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-surface" style={{ padding: 18 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 800, margin: '0 0 12px' }}>Stock faible</h3>
                  {stats.lowStock.length === 0 ? (
                    <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0 }}>Tout va bien, rien sous le seuil (2).</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {stats.lowStock.map((l, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span>{l.product} — taille {l.size}</span>
                          <span style={{ fontWeight: 800, color: l.stock === 0 ? 'var(--danger-text)' : 'var(--accent)' }}>{l.stock} en stock</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Supprimer ce produit ?"
        message={`"${toDelete?.name}" sera supprimé définitivement.`}
        confirmLabel="Supprimer"
        danger
        onConfirm={deleteProduct}
        onCancel={() => setToDelete(null)}
      />
      <ConfirmDialog
        open={!!catToDelete}
        title="Supprimer cette catégorie ?"
        message={`"${catToDelete?.name}" sera supprimée. Impossible si des produits l'utilisent encore.`}
        confirmLabel="Supprimer"
        danger
        onConfirm={deleteCategory}
        onCancel={() => setCatToDelete(null)}
      />
    </div>
  )
}

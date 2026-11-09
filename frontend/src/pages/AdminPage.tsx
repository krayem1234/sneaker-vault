import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { apiFetch } from '../lib/api'
import { useToast } from '../lib/toast'
import Select from '../components/Select'
import ConfirmDialog from '../components/ConfirmDialog'
import { TrashIcon, PlusIcon } from '../components/icons'

const SIZES = ['39', '40', '41', '42', '43', '44', '45']

type Category = { id: string; name: string; slug: string }
type Variant = { id: string; size: string; stock: number }
type Product = {
  id: string; name: string; slug: string; description: string; priceCents: number
  images: string[]; featured: boolean; category: Category; variants: Variant[]
}
type Order = {
  id: string; email: string; status: string; totalCents: number; createdAt: string
  user?: { name: string; email: string } | null
  items: { id: string; quantity: number; unitPriceCents: number; product: { name: string }; variant: { size: string } }[]
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState<'products' | 'orders'>('products')
  const [products, setProducts] = useState<Product[] | null>(null)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [toDelete, setToDelete] = useState<Product | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [image1, setImage1] = useState('')
  const [image2, setImage2] = useState('')
  const [featured, setFeatured] = useState(false)
  const [stocks, setStocks] = useState<Record<string, string>>(Object.fromEntries(SIZES.map((s) => [s, '5'])))
  const [creating, setCreating] = useState(false)

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

  useEffect(() => {
    if (!token || user?.role !== 'admin') return
    apiFetch('/categories', null).then((cats) => { setCategories(cats); if (cats[0]) setCategoryId(cats[0].id) })
    loadProducts()
    loadOrders()
  }, [token, user])

  async function createProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !categoryId || !price) { toast.show('Remplis au moins nom, prix et catégorie', 'error'); return }
    setCreating(true)
    try {
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
      setName(''); setDescription(''); setPrice(''); setImage1(''); setImage2(''); setFeatured(false)
      loadProducts()
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setCreating(false)
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
      loadProducts()
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setToDelete(null)
    }
  }

  if (!token || user?.role !== 'admin') return null

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 64px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 18px' }}>Admin</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className="btn-ghost" onClick={() => setTab('products')} style={{ background: tab === 'products' ? 'var(--accent)' : undefined, color: tab === 'products' ? '#fff' : undefined, borderColor: tab === 'products' ? 'var(--accent)' : undefined }}>Produits</button>
        <button className="btn-ghost" onClick={() => setTab('orders')} style={{ background: tab === 'orders' ? 'var(--accent)' : undefined, color: tab === 'orders' ? '#fff' : undefined, borderColor: tab === 'orders' ? 'var(--accent)' : undefined }}>Commandes</button>
      </div>

      {tab === 'products' ? (
        <>
          <form onSubmit={createProduct} className="card-surface" style={{ padding: 20, marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontSize: 15, margin: 0, fontWeight: 800 }}>Nouveau produit</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <input className="input" placeholder="Nom du produit" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="input" placeholder="Prix (€)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <textarea className="input" placeholder="Description (optionnel)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input className="input" placeholder="URL image 1" value={image1} onChange={(e) => setImage1(e.target.value)} />
              <input className="input" placeholder="URL image 2 (optionnel)" value={image2} onChange={(e) => setImage2(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' }}>
              <Select value={categoryId} onChange={setCategoryId} options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="Catégorie" />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Mettre en vedette
              </label>
            </div>
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
            <button className="btn-primary" type="submit" disabled={creating} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6 }}>
              <PlusIcon size={13} /> {creating ? 'Création...' : 'Créer le produit'}
            </button>
          </form>

          {products === null ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {products.map((p) => (
                <div key={p.id} className="card-surface" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <img src={p.images[0]} alt="" style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}{p.featured ? ' ⭐' : ''}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.category.name} — {(p.priceCents / 100).toFixed(2)} €</div>
                      </div>
                    </div>
                    <button className="icon-btn danger" onClick={() => setToDelete(p)}><TrashIcon size={14} /></button>
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
      ) : (
        <div>
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
                  </div>
                  {o.items.map((it) => (
                    <div key={it.id} style={{ fontSize: 12.5, color: 'var(--muted)' }}>{it.product.name} — taille {it.variant.size} × {it.quantity}</div>
                  ))}
                  <div style={{ textAlign: 'right', fontWeight: 800, marginTop: 6 }}>{(o.totalCents / 100).toFixed(2)} €</div>
                </div>
              ))}
            </div>
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
    </div>
  )
}

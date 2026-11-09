import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import ProductCard from '../components/ProductCard'

type Category = { id: string; name: string; slug: string }

export default function ShopPage() {
  const [products, setProducts] = useState<any[] | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')

  useEffect(() => {
    apiFetch('/categories', null).then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setProducts(null)
    const qs = activeCategory ? `?category=${activeCategory}` : ''
    apiFetch(`/products${qs}`, null).then(setProducts).catch(() => setProducts([]))
  }, [activeCategory])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 18px' }}>Boutique</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          className="btn-ghost"
          onClick={() => setActiveCategory('')}
          style={{ padding: '8px 16px', background: activeCategory === '' ? 'var(--accent)' : undefined, color: activeCategory === '' ? '#fff' : undefined, borderColor: activeCategory === '' ? 'var(--accent)' : undefined }}
        >
          Tout
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className="btn-ghost"
            onClick={() => setActiveCategory(c.slug)}
            style={{ padding: '8px 16px', background: activeCategory === c.slug ? 'var(--accent)' : undefined, color: activeCategory === c.slug ? '#fff' : undefined, borderColor: activeCategory === c.slug ? 'var(--accent)' : undefined }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {products === null
          ? [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 280 }} />)
          : products.length === 0
          ? <p style={{ color: 'var(--muted)' }}>Aucun produit dans cette catégorie.</p>
          : products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  )
}

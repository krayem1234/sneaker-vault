import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import ProductCard from '../components/ProductCard'
import Select from '../components/Select'
import { SearchIcon } from '../components/icons'

type Category = { id: string; name: string; slug: string }

const SORTS = [
  { value: 'newest', label: 'Nouveautés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name', label: 'Nom (A-Z)' },
]

export default function ShopPage() {
  const [items, setItems] = useState<any[] | null>(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get('category') || '')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  useEffect(() => {
    apiFetch('/categories', null).then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(1) }, [activeCategory, minPrice, maxPrice, sort])

  useEffect(() => {
    setItems(null)
    const params = new URLSearchParams()
    if (activeCategory) params.set('category', activeCategory)
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    params.set('sort', sort)
    params.set('page', String(page))
    params.set('limit', '12')
    apiFetch(`/products?${params.toString()}`, null)
      .then((res) => { setItems(res.items); setTotal(res.total); setPages(res.pages) })
      .catch(() => { setItems([]); setTotal(0); setPages(1) })
  }, [activeCategory, debouncedSearch, minPrice, maxPrice, sort, page])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 18px' }}>Boutique</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
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

      <div className="card-surface shop-filters" style={{ padding: 14, marginBottom: 24, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
            <SearchIcon size={15} />
          </span>
          <input
            className="input"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
        <input className="input" type="number" min={0} placeholder="Prix min €" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input className="input" type="number" min={0} placeholder="Prix max €" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <Select value={sort} onChange={setSort} options={SORTS} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {items === null
          ? [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 280 }} />)
          : items.length === 0
          ? <p style={{ color: 'var(--muted)' }}>Aucun produit ne correspond à ta recherche.</p>
          : items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {items && items.length > 0 && pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={{ padding: '8px 14px' }}>Précédent</button>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Page {page} / {pages} · {total} produits</span>
          <button className="btn-ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} style={{ padding: '8px 14px' }}>Suivant</button>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import ProductCard from '../components/ProductCard'

export default function HomePage() {
  const [featured, setFeatured] = useState<any[] | null>(null)

  useEffect(() => {
    apiFetch('/products?featured=true', null).then(setFeatured).catch(() => setFeatured([]))
  }, [])

  return (
    <div>
      <div style={{ padding: '64px 24px 48px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div className="badge" style={{ background: 'var(--chip-bg)', color: 'var(--muted)', marginBottom: 16 }}>
          Nouvelle collection
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 16px', letterSpacing: -1 }}>
          Marche comme<br /><span style={{ color: 'var(--accent)' }}>t'es le seul</span> à exister.
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 480, margin: '0 auto 28px' }}>
          Sneakers running & lifestyle, stock limité, livrées comme il faut.
        </p>
        <Link to="/shop" className="btn-primary" style={{ display: 'inline-block' }}>
          Voir la boutique
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <h2 style={{ fontSize: 20, margin: 0, fontWeight: 800 }}>En vedette</h2>
          <Link to="/shop" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>Tout voir →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {featured === null
            ? [0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 280 }} />)
            : featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  )
}

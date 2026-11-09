import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import ProductCard from '../components/ProductCard'
import { TruckIcon, ShieldIcon, RefreshIcon, SparkleIcon } from '../components/icons'
import { tiltMove, tiltLeave } from '../lib/useTilt'
import { useDocumentMeta } from '../lib/useDocumentMeta'

type CategoryCard = { id: string; name: string; slug: string; image?: string }

const VALUE_PROPS = [
  { icon: SparkleIcon, title: 'Éditions limitées', text: 'Des paires sélectionnées, en stock réduit.' },
  { icon: TruckIcon, title: 'Livraison rapide', text: 'Expédition sous 24-48h une fois la commande validée.' },
  { icon: ShieldIcon, title: 'Paiement sécurisé', text: 'Checkout Stripe chiffré — mode test pour cette démo.' },
  { icon: RefreshIcon, title: 'Retours faciles', text: '14 jours pour changer d\'avis, sans justification.' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState<any[] | null>(null)
  const [newest, setNewest] = useState<any[] | null>(null)
  const [categoryCards, setCategoryCards] = useState<CategoryCard[]>([])
  const [productCount, setProductCount] = useState<number | null>(null)

  useDocumentMeta({})

  useEffect(() => {
    apiFetch('/products?featured=true', null).then((data) => {
      setFeatured(data)
    }).catch(() => setFeatured([]))

    apiFetch('/products?sort=newest&page=1&limit=8', null).then((res) => {
      setNewest(res.items)
      setProductCount(res.total)
    }).catch(() => setNewest([]))

    apiFetch('/categories', null).then(async (cats) => {
      const withImages = await Promise.all(
        cats.map(async (c: any) => {
          try {
            const res = await apiFetch(`/products?category=${c.slug}&page=1&limit=1`, null)
            return { ...c, image: res.items[0]?.images?.[0] }
          } catch {
            return c
          }
        }),
      )
      setCategoryCards(withImages)
    }).catch(() => {})
  }, [])

  const featuredIds = new Set((featured || []).map((p) => p.id))
  const newArrivals = (newest || []).filter((p) => !featuredIds.has(p.id)).slice(0, 4)

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
          Sneakers running, trail & lifestyle, stock limité, livrées comme il faut.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/shop" className="btn-primary" style={{ display: 'inline-block' }}>
            Voir la boutique
          </Link>
          <Link to="/shop?sort=newest" className="btn-ghost" style={{ display: 'inline-block' }}>
            Dernières sorties
          </Link>
        </div>
        {productCount !== null && (
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{productCount}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.04 }}>Modèles</div>
            </div>
            <div style={{ width: 1, background: 'var(--line)' }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{categoryCards.length || 3}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.04 }}>Univers</div>
            </div>
            <div style={{ width: 1, background: 'var(--line)' }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>7</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.04 }}>Pointures</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {VALUE_PROPS.map((v) => (
            <div
              key={v.title}
              className="card-surface tilt-card"
              onMouseMove={(e) => tiltMove(e, 5, 1.015)}
              onMouseLeave={tiltLeave}
              style={{ padding: 18, display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative' }}
            >
              <div className="tilt-glare" style={{ borderRadius: 16 }} />
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                <v.icon size={17} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 3 }}>{v.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{v.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {categoryCards.length > 0 && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 56px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <h2 style={{ fontSize: 20, margin: 0, fontWeight: 800 }}>Par univers</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {categoryCards.map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${c.slug}`}
                className="card-surface tilt-card slide-up"
                onMouseMove={(e) => tiltMove(e, 6, 1.02)}
                onMouseLeave={tiltLeave}
                style={{ position: 'relative', height: 180, overflow: 'hidden', display: 'block' }}
              >
                <div className="tilt-glare" />
                {c.image && (
                  <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.55 }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.65), transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 18, color: '#fff' }}>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{c.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>Découvrir →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 56px' }}>
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

      {newArrivals.length > 0 && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 56px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <h2 style={{ fontSize: 20, margin: 0, fontWeight: 800 }}>Dernières sorties</h2>
            <Link to="/shop" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>Tout voir →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 72px' }}>
        <div
          className="card-surface"
          style={{
            padding: '48px 32px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255,90,31,0.14), rgba(215,255,58,0.08))',
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 10px' }}>Prêt à trouver ta paire ?</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14.5, margin: '0 0 22px' }}>
            Running, trail ou lifestyle — {productCount ?? 'des dizaines de'} modèles t'attendent dans la boutique.
          </p>
          <Link to="/shop" className="btn-primary" style={{ display: 'inline-block' }}>
            Voir toute la collection
          </Link>
        </div>
      </div>
    </div>
  )
}


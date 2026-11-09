import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useWishlist } from '../lib/wishlist'
import { useToast } from '../lib/toast'
import { tiltMove, tiltLeave } from '../lib/useTilt'
import { HeartIcon } from './icons'
import StarRating from './StarRating'

type Product = {
  id: string
  slug: string
  name: string
  priceCents: number
  images: string[]
  category: { name: string }
  featured?: boolean
  variants: { stock: number }[]
  avgRating?: number
  reviewCount?: number
}

export default function ProductCard({ product }: { product: Product }) {
  const inStock = product.variants.some((v) => v.stock > 0)
  const { token } = useAuth()
  const { productIds, toggle } = useWishlist()
  const toast = useToast()
  const navigate = useNavigate()
  const wished = productIds.has(product.id)

  function onHeartClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!token) { toast.show('Connecte-toi pour ajouter des favoris', 'error'); navigate('/login'); return }
    toggle(product.id)
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className="product-card tilt-card slide-up"
      onMouseMove={(e) => tiltMove(e, 8, 1.02)}
      onMouseLeave={tiltLeave}
      style={{ position: 'relative' }}
    >
      <div className="tilt-glare" />
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img src={product.images[0]} alt={product.name} loading="lazy" />
        {product.featured && (
          <span className="badge" style={{ position: 'absolute', top: 10, left: 10, background: 'var(--volt)', color: '#0a0a0a' }}>
            Featured
          </span>
        )}
        {!inStock && (
          <span className="badge" style={{ position: 'absolute', top: 10, right: 10, background: 'var(--danger-bg)', color: 'var(--danger-text)' }}>
            Épuisé
          </span>
        )}
        <button
          onClick={onHeartClick}
          className="icon-btn"
          style={{ position: 'absolute', bottom: 8, right: 8, background: 'var(--surface-2)', color: wished ? 'var(--accent)' : 'var(--text)' }}
          title="Favoris"
        >
          <HeartIcon size={16} filled={wished} />
        </button>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.04 }}>{product.category.name}</div>
        <div style={{ fontWeight: 700, fontSize: 14.5, margin: '4px 0 6px' }}>{product.name}</div>
        {!!product.reviewCount && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <StarRating value={product.avgRating || 0} size={11} />
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>({product.reviewCount})</span>
          </div>
        )}
        <div style={{ fontWeight: 800, fontSize: 15 }}>{(product.priceCents / 100).toFixed(2)} €</div>
      </div>
    </Link>
  )
}

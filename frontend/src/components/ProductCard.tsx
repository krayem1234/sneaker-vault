import { Link } from 'react-router-dom'

type Product = {
  slug: string
  name: string
  priceCents: number
  images: string[]
  category: { name: string }
  featured?: boolean
  variants: { stock: number }[]
}

export default function ProductCard({ product }: { product: Product }) {
  const inStock = product.variants.some((v) => v.stock > 0)
  return (
    <Link to={`/product/${product.slug}`} className="product-card slide-up">
      <div style={{ position: 'relative' }}>
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
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.04 }}>{product.category.name}</div>
        <div style={{ fontWeight: 700, fontSize: 14.5, margin: '4px 0 6px' }}>{product.name}</div>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{(product.priceCents / 100).toFixed(2)} €</div>
      </div>
    </Link>
  )
}

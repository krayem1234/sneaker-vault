import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useCart } from '../lib/cart'
import { useToast } from '../lib/toast'
import { ChevronLeftIcon } from '../components/icons'

type Variant = { id: string; size: string; stock: number }
type Product = {
  id: string
  name: string
  slug: string
  description: string
  priceCents: number
  images: string[]
  category: { name: string }
  variants: Variant[]
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { add } = useCart()
  const toast = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    apiFetch(`/products/${slug}`, null)
      .then((p) => { setProduct(p); setActiveImage(0); setSelectedSize(null) })
      .catch(() => toast.show('Produit introuvable', 'error'))
  }, [slug])

  if (!product) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div className="skeleton" style={{ height: 420 }} />
      </div>
    )
  }

  const variant = product.variants.find((v) => v.size === selectedSize)

  function addToCart() {
    if (!variant) { toast.show('Choisis une taille', 'error'); return }
    add({
      productId: product!.id,
      variantId: variant.id,
      name: product!.name,
      size: variant.size,
      priceCents: product!.priceCents,
      image: product!.images[0],
      maxStock: variant.stock,
    })
    toast.show('Ajouté au panier', 'success')
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 24px 64px' }}>
      <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--muted)', fontSize: 13, marginBottom: 18 }}>
        <ChevronLeftIcon size={13} /> Boutique
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
        <div>
          <div className="card-surface" style={{ overflow: 'hidden', marginBottom: 10 }}>
            <img src={product.images[activeImage]} alt={product.name} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', display: 'block' }} />
          </div>
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} style={{ padding: 0, border: i === activeImage ? '2px solid var(--accent)' : '2px solid transparent', borderRadius: 10, overflow: 'hidden', background: 'none' }}>
                  <img src={img} alt="" style={{ width: 56, height: 56, objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>{product.category.name}</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: '6px 0 10px' }}>{product.name}</h1>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>{(product.priceCents / 100).toFixed(2)} €</div>
          <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.6, marginBottom: 24 }}>{product.description}</p>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 10 }}>POINTURE</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  className={`size-pill${selectedSize === v.size ? ' selected' : ''}`}
                  disabled={v.stock === 0}
                  onClick={() => setSelectedSize(v.size)}
                >
                  {v.size}
                </button>
              ))}
            </div>
            {variant && variant.stock <= 3 && (
              <div style={{ fontSize: 12, color: 'var(--danger-text)', marginTop: 8, fontWeight: 600 }}>
                Plus que {variant.stock} en stock
              </div>
            )}
          </div>

          <button className="btn-primary" style={{ width: '100%' }} onClick={addToCart}>
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  )
}

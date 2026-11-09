import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { useWishlist } from '../lib/wishlist'
import { useToast } from '../lib/toast'
import { ChevronLeftIcon, HeartIcon, RulerIcon } from '../components/icons'
import StarRating from '../components/StarRating'
import ProductCard from '../components/ProductCard'
import SizeGuideModal from '../components/SizeGuideModal'
import RecentlyViewed from '../components/RecentlyViewed'
import NotifyMeForm from '../components/NotifyMeForm'
import ShareButton from '../components/ShareButton'
import { pushRecentlyViewed } from '../lib/recentlyViewed'
import { useDocumentMeta } from '../lib/useDocumentMeta'

type Variant = { id: string; size: string; stock: number }
type Review = { id: string; rating: number; comment: string; createdAt: string; user: { name: string } }
type Product = {
  id: string
  name: string
  slug: string
  description: string
  priceCents: number
  images: string[]
  category: { name: string; slug: string }
  variants: Variant[]
  avgRating: number
  reviewCount: number
  reviews: Review[]
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { add } = useCart()
  const { token, user } = useAuth()
  const { productIds, toggle } = useWishlist()
  const toast = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [similar, setSimilar] = useState<any[]>([])
  const [zoomStyle, setZoomStyle] = useState<{ transform?: string; transformOrigin?: string }>({})
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  function load() {
    if (!slug) return
    apiFetch(`/products/${slug}`, null)
      .then((p) => {
        setProduct(p)
        pushRecentlyViewed({ id: p.id, name: p.name, slug: p.slug, priceCents: p.priceCents, images: p.images, category: { name: p.category.name }, variants: p.variants.map((v: any) => ({ stock: v.stock })) })
        setActiveImage(0)
        setSelectedSize(null)
        setMyRating(0)
        setMyComment('')
        apiFetch(`/products?category=${p.category.slug}`, null)
          .then((list: any[]) => setSimilar(list.filter((x) => x.id !== p.id).slice(0, 4)))
          .catch(() => setSimilar([]))
      })
      .catch(() => toast.show('Produit introuvable', 'error'))
  }

  useEffect(load, [slug])

  useDocumentMeta({
    title: product?.name,
    description: product?.description,
    image: product?.images[0],
    type: 'product',
  })

  if (!product) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <div className="skeleton" style={{ height: 420 }} />
      </div>
    )
  }

  const variant = product.variants.find((v) => v.size === selectedSize)
  const wished = productIds.has(product.id)

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

  function onWishlistClick() {
    if (!token) { toast.show('Connecte-toi pour ajouter des favoris', 'error'); navigate('/login'); return }
    toggle(product!.id)
  }

  function onImageMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomStyle({ transform: 'scale(1.9)', transformOrigin: `${x}% ${y}%` })
  }
  function onImageMouseLeave() {
    setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center' })
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!myRating) { toast.show('Choisis une note', 'error'); return }
    setSubmittingReview(true)
    try {
      await apiFetch(`/products/${product!.id}/reviews`, token, {
        method: 'POST',
        body: JSON.stringify({ rating: myRating, comment: myComment }),
      })
      toast.show('Avis publié, merci !', 'success')
      load()
    } catch (err: any) {
      toast.show(err.message, 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 24px 64px' }}>
      <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--muted)', fontSize: 13, marginBottom: 18 }}>
        <ChevronLeftIcon size={13} /> Boutique
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
        <div>
          <div
            className="card-surface"
            style={{ overflow: 'hidden', marginBottom: 10, cursor: 'zoom-in' }}
            onMouseMove={onImageMouseMove}
            onMouseLeave={onImageMouseLeave}
          >
            <img
              src={product.images[activeImage]}
              alt={product.name}
              style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', display: 'block', transition: 'transform 0.08s ease-out', ...zoomStyle }}
            />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>{product.category.name}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <ShareButton title={product.name} text={`Découvre ${product.name} sur Vault Kicks`} />
              <button className="icon-btn" onClick={onWishlistClick} style={{ color: wished ? 'var(--accent)' : 'var(--text)' }} title="Favoris">
                <HeartIcon size={19} filled={wished} />
              </button>
            </div>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: '6px 0 6px' }}>{product.name}</h1>
          {product.reviewCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <StarRating value={product.avgRating} size={14} />
              <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{product.avgRating} / 5 ({product.reviewCount} avis)</span>
            </div>
          )}
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>{(product.priceCents / 100).toFixed(2)} €</div>
          <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.6, marginBottom: 24 }}>{product.description}</p>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>POINTURE</div>
              <button
                onClick={() => setSizeGuideOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <RulerIcon size={13} /> Guide des tailles
              </button>
            </div>
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
            {variant && variant.stock > 0 && variant.stock <= 3 && (
              <div style={{ fontSize: 12, color: 'var(--danger-text)', marginTop: 8, fontWeight: 600 }}>
                Plus que {variant.stock} en stock
              </div>
            )}
            {variant && variant.stock === 0 && (
              <NotifyMeForm productId={product.id} size={variant.size} defaultEmail={user?.email} />
            )}
          </div>
          <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

          <button className="btn-primary" style={{ width: '100%' }} onClick={addToCart}>
            Ajouter au panier
          </button>
        </div>
      </div>

      <div style={{ marginTop: 56 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Avis clients</h2>

        {token ? (
          <form onSubmit={submitReview} className="card-surface" style={{ padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Ta note :</span>
              <StarRating value={myRating} size={18} interactive onChange={setMyRating} />
            </div>
            <textarea className="input" placeholder="Ton avis (optionnel)" value={myComment} onChange={(e) => setMyComment(e.target.value)} />
            <button className="btn-primary" type="submit" disabled={submittingReview} style={{ alignSelf: 'flex-start' }}>
              {submittingReview ? 'Envoi...' : 'Publier mon avis'}
            </button>
          </form>
        ) : (
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 20 }}>
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Connecte-toi</Link> pour laisser un avis.
          </p>
        )}

        {product.reviews.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>Aucun avis pour l'instant — sois le premier.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {product.reviews.map((r) => (
              <div key={r.id} className="card-surface" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{r.user.name}</span>
                  <StarRating value={r.rating} size={12} />
                </div>
                {r.comment && <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {similar.length > 0 && (
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Produits similaires</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {similar.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      <RecentlyViewed excludeId={product.id} />
    </div>
  )
}

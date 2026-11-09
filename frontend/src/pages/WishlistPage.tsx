import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { useWishlist } from '../lib/wishlist'
import ProductCard from '../components/ProductCard'
import { HeartIcon } from '../components/icons'

export default function WishlistPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { products, loading } = useWishlist()

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token])

  if (!token) return null

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 64px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>Mes favoris</h1>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 280 }} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="card-surface" style={{ padding: 40, textAlign: 'center' }}>
          <HeartIcon size={24} />
          <p style={{ color: 'var(--muted)', marginTop: 10 }}>Aucun favori pour l'instant. Ajoute des paires depuis la boutique.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}

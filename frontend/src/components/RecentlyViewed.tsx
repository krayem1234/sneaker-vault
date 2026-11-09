import { getRecentlyViewed } from '../lib/recentlyViewed'
import ProductCard from './ProductCard'

export default function RecentlyViewed({ excludeId, title = 'Récemment consultés' }: { excludeId?: string; title?: string }) {
  const items = getRecentlyViewed(excludeId)
  if (items.length === 0) return null

  return (
    <div style={{ marginTop: 56 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {items.map((p) => <ProductCard key={p.id} product={p as any} />)}
      </div>
    </div>
  )
}

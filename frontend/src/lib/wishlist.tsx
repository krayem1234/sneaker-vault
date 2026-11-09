import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiFetch } from './api'
import { useAuth } from './auth'

type WishlistCtx = {
  productIds: Set<string>
  products: any[]
  loading: boolean
  toggle: (productId: string) => Promise<void>
  refresh: () => void
}

const Ctx = createContext<WishlistCtx | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  function refresh() {
    if (!token) { setProducts([]); return }
    setLoading(true)
    apiFetch('/wishlist', token).then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false))
  }

  useEffect(refresh, [token])

  async function toggle(productId: string) {
    if (!token) return
    const has = products.some((p) => p.id === productId)
    setProducts((prev) => (has ? prev.filter((p) => p.id !== productId) : prev)) // optimistic remove; add is confirmed by refresh
    try {
      if (has) await apiFetch(`/wishlist/${productId}`, token, { method: 'DELETE' })
      else await apiFetch(`/wishlist/${productId}`, token, { method: 'POST' })
    } finally {
      refresh()
    }
  }

  const productIds = new Set(products.map((p) => p.id))

  return <Ctx.Provider value={{ productIds, products, loading, toggle, refresh }}>{children}</Ctx.Provider>
}

export function useWishlist() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}

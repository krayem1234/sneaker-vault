import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type CartItem = {
  productId: string
  variantId: string
  name: string
  size: string
  priceCents: number
  image: string
  quantity: number
  maxStock: number
}

type CartCtx = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQty: (variantId: string, quantity: number) => void
  remove: (variantId: string) => void
  clear: () => void
  totalCents: number
  count: number
}

const Ctx = createContext<CartCtx | null>(null)

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem('sv_cart')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load)

  useEffect(() => {
    try { localStorage.setItem('sv_cart', JSON.stringify(items)) } catch {}
  }, [items])

  function add(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId)
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, existing.maxStock)
        return prev.map((i) => (i.variantId === item.variantId ? { ...i, quantity: nextQty } : i))
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.maxStock) }]
    })
  }

  function updateQty(variantId: string, quantity: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.variantId === variantId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) } : i))
        .filter((i) => i.quantity > 0),
    )
  }

  function remove(variantId: string) {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId))
  }

  function clear() {
    setItems([])
  }

  const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return <Ctx.Provider value={{ items, add, updateQty, remove, clear, totalCents, count }}>{children}</Ctx.Provider>
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

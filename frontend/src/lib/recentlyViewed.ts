export type RecentProduct = {
  id: string
  slug: string
  name: string
  priceCents: number
  images: string[]
  category: { name: string }
  variants: { stock: number }[]
}

const KEY = 'sv_recently_viewed'
const MAX = 8

export function pushRecentlyViewed(p: RecentProduct) {
  try {
    const raw = localStorage.getItem(KEY)
    const list: RecentProduct[] = raw ? JSON.parse(raw) : []
    const next = [p, ...list.filter((x) => x.id !== p.id)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

export function getRecentlyViewed(excludeId?: string): RecentProduct[] {
  try {
    const raw = localStorage.getItem(KEY)
    const list: RecentProduct[] = raw ? JSON.parse(raw) : []
    return excludeId ? list.filter((x) => x.id !== excludeId) : list
  } catch {
    return []
  }
}

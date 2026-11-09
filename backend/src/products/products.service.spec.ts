import { ProductsService } from './products.service'

function makePrismaMock(products: any[]) {
  return {
    product: {
      findMany: jest.fn().mockResolvedValue(products),
      count: jest.fn().mockResolvedValue(products.length),
      findUnique: jest.fn().mockImplementation(({ where }: any) => products.find((p) => p.slug === where.slug) || null),
    },
  } as any
}

describe('ProductsService', () => {
  const rawProduct = {
    id: 'p1',
    name: 'Air Runner',
    slug: 'air-runner',
    description: 'desc',
    priceCents: 12000,
    images: JSON.stringify(['a.jpg', 'b.jpg']),
    featured: true,
    category: { id: 'c1', name: 'Running', slug: 'running' },
    variants: [{ id: 'v1', size: '42', stock: 3 }],
    reviews: [{ rating: 4 }, { rating: 5 }],
  }

  it('parses the JSON-encoded images field into an array', async () => {
    const service = new ProductsService(makePrismaMock([rawProduct]))
    const [product] = (await service.list()) as any[]
    expect(Array.isArray(product.images)).toBe(true)
    expect(product.images).toEqual(['a.jpg', 'b.jpg'])
  })

  it('computes an average rating from the linked reviews', async () => {
    const service = new ProductsService(makePrismaMock([rawProduct]))
    const [product] = (await service.list()) as any[]
    expect(product.avgRating).toBe(4.5)
    expect(product.reviewCount).toBe(2)
  })

  it('returns a paginated shape when a page is requested', async () => {
    const service = new ProductsService(makePrismaMock([rawProduct]))
    const result = (await service.list({ page: 1, limit: 12 })) as any
    expect(result).toHaveProperty('items')
    expect(result).toHaveProperty('total', 1)
    expect(result).toHaveProperty('pages', 1)
  })

  it('throws when the product does not exist', async () => {
    const service = new ProductsService(makePrismaMock([]))
    await expect(service.bySlug('unknown')).rejects.toThrow('Produit introuvable')
  })
})

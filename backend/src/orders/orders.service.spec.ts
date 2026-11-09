import { OrdersService } from './orders.service'

function makeDeps(variant: any) {
  const prisma = {
    productVariant: { findMany: jest.fn().mockResolvedValue([variant]) },
    order: { create: jest.fn(), update: jest.fn() },
  } as any
  const mail = { sendOrderConfirmation: jest.fn() } as any
  const promos = { validate: jest.fn() } as any
  return { prisma, mail, promos }
}

describe('OrdersService.checkout', () => {
  const variant = { id: 'v1', productId: 'p1', size: '42', stock: 2, product: { id: 'p1', name: 'Air Runner', priceCents: 10000, images: '[]' } }

  it('rejects an empty cart', async () => {
    const { prisma, mail, promos } = makeDeps(variant)
    const service = new OrdersService(prisma, mail, promos)
    await expect(service.checkout([], 'a@b.com')).rejects.toThrow('Le panier est vide')
  })

  it('rejects when checkout exceeds the available stock', async () => {
    const { prisma, mail, promos } = makeDeps(variant)
    const service = new OrdersService(prisma, mail, promos)
    await expect(
      service.checkout([{ productId: 'p1', variantId: 'v1', quantity: 5 }], 'a@b.com'),
    ).rejects.toThrow('Stock insuffisant')
  })

  it('refuses to checkout when Stripe has no key configured', async () => {
    const original = process.env.STRIPE_SECRET_KEY
    delete process.env.STRIPE_SECRET_KEY
    const { prisma, mail, promos } = makeDeps(variant)
    const service = new OrdersService(prisma, mail, promos)
    await expect(
      service.checkout([{ productId: 'p1', variantId: 'v1', quantity: 1 }], 'a@b.com'),
    ).rejects.toThrow("Le paiement n'est pas configuré")
    if (original) process.env.STRIPE_SECRET_KEY = original
  })
})

import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { MailService } from '../mail/mail.service'
import { PushService } from '../push/push.service'

function withParsedImages<T extends { images: string }>(product: T): Omit<T, 'images'> & { images: string[] } {
  let images: string[] = []
  try {
    images = JSON.parse(product.images)
  } catch {
    images = product.images ? [product.images] : []
  }
  return { ...product, images }
}

function withRating<T extends { reviews?: { rating: number }[] }>(product: T) {
  const reviews = product.reviews || []
  const reviewCount = reviews.length
  const avgRating = reviewCount ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0
  const { reviews: _omit, ...rest } = product as any
  return { ...rest, avgRating: Math.round(avgRating * 10) / 10, reviewCount }
}

export type ListOptions = {
  categorySlug?: string
  featured?: boolean
  search?: string
  minPriceCents?: number
  maxPriceCents?: number
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name'
  page?: number
  limit?: number
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService, private mail: MailService, private push: PushService) {}

  async list(opts: ListOptions = {}) {
    const where = {
      ...(opts.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
      ...(opts.featured ? { featured: true } : {}),
      ...(opts.search ? { name: { contains: opts.search } } : {}),
      ...(opts.minPriceCents !== undefined || opts.maxPriceCents !== undefined
        ? { priceCents: { ...(opts.minPriceCents !== undefined ? { gte: opts.minPriceCents } : {}), ...(opts.maxPriceCents !== undefined ? { lte: opts.maxPriceCents } : {}) } }
        : {}),
    }

    const orderBy =
      opts.sort === 'price_asc' ? { priceCents: 'asc' as const }
      : opts.sort === 'price_desc' ? { priceCents: 'desc' as const }
      : opts.sort === 'name' ? { name: 'asc' as const }
      : { createdAt: 'desc' as const }

    const include = { category: true, variants: true, reviews: { select: { rating: true } } }

    if (opts.page) {
      const limit = opts.limit && opts.limit > 0 ? opts.limit : 12
      const page = opts.page > 0 ? opts.page : 1
      const [items, total] = await Promise.all([
        this.prisma.product.findMany({ where, include, orderBy, skip: (page - 1) * limit, take: limit }),
        this.prisma.product.count({ where }),
      ])
      return {
        items: items.map(withParsedImages).map(withRating),
        total,
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
      }
    }

    const products = await this.prisma.product.findMany({ where, include, orderBy })
    return products.map(withParsedImages).map(withRating)
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 30 },
      },
    })
    if (!product) throw new NotFoundException('Produit introuvable')
    const reviews = product.reviews || []
    const reviewCount = reviews.length
    const avgRating = reviewCount ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0
    return {
      ...withParsedImages(product),
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount,
      reviews,
    }
  }

  async create(data: {
    name: string
    slug: string
    description: string
    priceCents: number
    images: string[]
    categoryId: string
    featured?: boolean
    sizes: { size: string; stock: number }[]
  }) {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceCents: data.priceCents,
        images: JSON.stringify(data.images),
        categoryId: data.categoryId,
        featured: data.featured ?? false,
        variants: { create: data.sizes },
      },
      include: { variants: true, category: true },
    })
    return withParsedImages(product)
  }

  async update(id: string, data: Partial<{ name: string; description: string; priceCents: number; images: string[]; categoryId: string; featured: boolean }>) {
    const { images, ...rest } = data
    const product = await this.prisma.product.update({
      where: { id },
      data: { ...rest, ...(images ? { images: JSON.stringify(images) } : {}) },
      include: { variants: true, category: true },
    })
    return withParsedImages(product)
  }

  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } })
    return { ok: true }
  }

  async setStock(productId: string, variantId: string, stock: number) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } })
    if (!variant || variant.productId !== productId) throw new NotFoundException('Variante introuvable')
    const wasOut = variant.stock <= 0
    const updated = await this.prisma.productVariant.update({ where: { id: variantId }, data: { stock } })
    if (wasOut && stock > 0) {
      this.notifyBackInStock(productId, variant.size).catch(() => {})
    }
    return updated
  }

  private async notifyBackInStock(productId: string, size: string) {
    const subs = await this.prisma.stockNotification.findMany({ where: { productId, size, notified: false } })
    if (!subs.length) return
    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) return
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174'
    for (const sub of subs) {
      await this.mail.sendBackInStock(sub.email, product.name, size, `${frontendUrl}/product/${product.slug}`)
      this.push.sendToEmail(
        sub.email,
        'De retour en stock !',
        `${product.name} (taille ${size}) est de nouveau disponible.`,
        { productSlug: product.slug },
      ).catch(() => {})
    }
    await this.prisma.stockNotification.updateMany({ where: { productId, size, notified: false }, data: { notified: true } })
  }

  async notifyMe(productId: string, size: string, email: string) {
    const variant = await this.prisma.productVariant.findFirst({ where: { productId, size } })
    if (!variant) throw new NotFoundException('Pointure introuvable')
    await this.prisma.stockNotification.upsert({
      where: { email_productId_size: { email, productId, size } },
      update: { notified: false },
      create: { email, productId, size },
    })
    return { ok: true }
  }

  async exportCsv() {
    const products = await this.prisma.product.findMany({ include: { category: true, variants: true }, orderBy: { createdAt: 'desc' } })
    const header = ['id', 'name', 'slug', 'category', 'priceCents', 'featured', 'totalStock']
    const rows = products.map((p) => {
      const totalStock = p.variants.reduce((s, v) => s + v.stock, 0)
      return [p.id, p.name, p.slug, p.category.name, String(p.priceCents), String(p.featured), String(totalStock)]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(',')
    })
    return [header.join(','), ...rows].join('\n')
  }

  async importStockCsv(csvText: string) {
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    if (!lines.length) return { updated: 0, errors: ['Fichier vide'] }
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const slugIdx = header.indexOf('slug')
    const sizeIdx = header.indexOf('size')
    const stockIdx = header.indexOf('stock')
    if (slugIdx === -1 || sizeIdx === -1 || stockIdx === -1) {
      return { updated: 0, errors: ['En-têtes attendus: slug,size,stock'] }
    }
    let updated = 0
    const errors: string[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim())
      const slug = cols[slugIdx]
      const size = cols[sizeIdx]
      const stock = parseInt(cols[stockIdx], 10)
      if (!slug || !size || Number.isNaN(stock)) { errors.push(`Ligne ${i + 1} invalide`); continue }
      const product = await this.prisma.product.findUnique({ where: { slug } })
      if (!product) { errors.push(`Ligne ${i + 1}: produit "${slug}" introuvable`); continue }
      try {
        await this.setStock(product.id, (await this.prisma.productVariant.findFirst({ where: { productId: product.id, size } }))?.id || '', Math.max(0, stock))
        updated++
      } catch {
        errors.push(`Ligne ${i + 1}: pointure "${size}" introuvable pour ${slug}`)
      }
    }
    return { updated, errors }
  }

  async addVariant(productId: string, size: string, stock: number) {
    return this.prisma.productVariant.upsert({
      where: { productId_size: { productId, size } },
      update: { stock },
      create: { productId, size, stock },
    })
  }

  async listAllForAdmin() {
    const products = await this.prisma.product.findMany({ include: { category: true, variants: true }, orderBy: { createdAt: 'desc' } })
    return products.map(withParsedImages)
  }
}

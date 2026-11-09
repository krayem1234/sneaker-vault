import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  list(categorySlug?: string, featured?: boolean) {
    return this.prisma.product.findMany({
      where: {
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(featured ? { featured: true } : {}),
      },
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true, variants: true },
    })
    if (!product) throw new NotFoundException('Produit introuvable')
    return product
  }

  create(data: {
    name: string
    slug: string
    description: string
    priceCents: number
    images: string[]
    categoryId: string
    featured?: boolean
    sizes: { size: string; stock: number }[]
  }) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceCents: data.priceCents,
        images: data.images,
        categoryId: data.categoryId,
        featured: data.featured ?? false,
        variants: { create: data.sizes },
      },
      include: { variants: true, category: true },
    })
  }

  async update(id: string, data: Partial<{ name: string; description: string; priceCents: number; images: string[]; categoryId: string; featured: boolean }>) {
    return this.prisma.product.update({ where: { id }, data, include: { variants: true, category: true } })
  }

  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } })
    return { ok: true }
  }

  async setStock(productId: string, variantId: string, stock: number) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } })
    if (!variant || variant.productId !== productId) throw new NotFoundException('Variante introuvable')
    return this.prisma.productVariant.update({ where: { id: variantId }, data: { stock } })
  }

  async addVariant(productId: string, size: string, stock: number) {
    return this.prisma.productVariant.upsert({
      where: { productId_size: { productId, size } },
      update: { stock },
      create: { productId, size, stock },
    })
  }

  listAllForAdmin() {
    return this.prisma.product.findMany({ include: { category: true, variants: true }, orderBy: { createdAt: 'desc' } })
  }
}

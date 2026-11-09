import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

function withParsedImages<T extends { images: string }>(product: T) {
  let images: string[] = []
  try { images = JSON.parse(product.images) } catch { images = product.images ? [product.images] : [] }
  return { ...product, images }
}

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { include: { category: true, variants: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return items.map((i) => withParsedImages(i.product))
  }

  async add(userId: string, productId: string) {
    await this.prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    })
    return { ok: true }
  }

  async remove(userId: string, productId: string) {
    await this.prisma.wishlistItem.delete({ where: { userId_productId: { userId, productId } } }).catch(() => null)
    return { ok: true }
  }
}

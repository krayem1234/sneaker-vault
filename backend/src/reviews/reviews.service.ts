import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async list(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async upsert(productId: string, userId: string, rating: number, comment: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) throw new NotFoundException('Produit introuvable')
    return this.prisma.review.upsert({
      where: { userId_productId: { userId, productId } },
      update: { rating, comment },
      create: { productId, userId, rating, comment },
      include: { user: { select: { name: true } } },
    })
  }

  async remove(productId: string, userId: string) {
    await this.prisma.review.delete({ where: { userId_productId: { userId, productId } } }).catch(() => null)
    return { ok: true }
  }
}

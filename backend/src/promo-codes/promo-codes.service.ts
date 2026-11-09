import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PromoCodesService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } })
  }

  create(code: string, percentOff: number, expiresAt?: string) {
    return this.prisma.promoCode.create({
      data: { code: code.trim().toUpperCase(), percentOff, expiresAt: expiresAt ? new Date(expiresAt) : null },
    })
  }

  async setActive(id: string, active: boolean) {
    return this.prisma.promoCode.update({ where: { id }, data: { active } })
  }

  async remove(id: string) {
    await this.prisma.promoCode.delete({ where: { id } })
    return { ok: true }
  }

  async validate(code: string) {
    const promo = await this.prisma.promoCode.findUnique({ where: { code: code.trim().toUpperCase() } })
    if (!promo || !promo.active) throw new NotFoundException('Code promo invalide')
    if (promo.expiresAt && promo.expiresAt < new Date()) throw new BadRequestException('Ce code promo a expiré')
    return promo
  }
}

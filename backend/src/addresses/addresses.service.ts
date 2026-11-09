import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] })
  }

  async create(userId: string, data: { label?: string; fullName: string; line1: string; line2?: string; city: string; zip: string; country?: string; isDefault?: boolean }) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
    }
    return this.prisma.address.create({ data: { ...data, userId } })
  }

  async update(userId: string, id: string, data: Partial<{ label: string; fullName: string; line1: string; line2: string; city: string; zip: string; country: string; isDefault: boolean }>) {
    const existing = await this.prisma.address.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) throw new NotFoundException('Adresse introuvable')
    if (data.isDefault) {
      await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
    }
    return this.prisma.address.update({ where: { id }, data })
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.address.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) throw new NotFoundException('Adresse introuvable')
    await this.prisma.address.delete({ where: { id } })
    return { ok: true }
  }
}

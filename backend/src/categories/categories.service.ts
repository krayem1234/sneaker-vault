import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } })
  }

  create(name: string, slug: string) {
    return this.prisma.category.create({ data: { name, slug } })
  }

  update(id: string, data: Partial<{ name: string; slug: string }>) {
    return this.prisma.category.update({ where: { id }, data })
  }

  async remove(id: string) {
    const count = await this.prisma.product.count({ where: { categoryId: id } })
    if (count > 0) throw new BadRequestException(`Impossible : ${count} produit(s) utilisent encore cette catégorie`)
    await this.prisma.category.delete({ where: { id } })
    return { ok: true }
  }
}

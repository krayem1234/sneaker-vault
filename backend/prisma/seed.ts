import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SIZES = ['39', '40', '41', '42', '43', '44', '45']

function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/800/800`
}

async function main() {
  const running = await prisma.category.upsert({
    where: { slug: 'running' },
    update: {},
    create: { name: 'Running', slug: 'running' },
  })
  const lifestyle = await prisma.category.upsert({
    where: { slug: 'lifestyle' },
    update: {},
    create: { name: 'Lifestyle', slug: 'lifestyle' },
  })

  const products = [
    { name: 'Vault Runner X1', slug: 'vault-runner-x1', price: 12900, cat: running.id, featured: true, seed: 'vr-x1' },
    { name: 'Nimbus Flow', slug: 'nimbus-flow', price: 14900, cat: running.id, featured: true, seed: 'nimbus-flow' },
    { name: 'Pulse Trainer', slug: 'pulse-trainer', price: 10900, cat: running.id, featured: false, seed: 'pulse-trainer' },
    { name: 'Street Low', slug: 'street-low', price: 9900, cat: lifestyle.id, featured: true, seed: 'street-low' },
    { name: 'Vault Classic 90', slug: 'vault-classic-90', price: 13900, cat: lifestyle.id, featured: false, seed: 'vault-classic-90' },
    { name: 'Midnight High', slug: 'midnight-high', price: 15900, cat: lifestyle.id, featured: true, seed: 'midnight-high' },
    { name: 'Terra Trail', slug: 'terra-trail', price: 16900, cat: running.id, featured: false, seed: 'terra-trail' },
    { name: 'Chalk Low', slug: 'chalk-low', price: 8900, cat: lifestyle.id, featured: false, seed: 'chalk-low' },
  ]

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: `${p.name} — confort et style au quotidien. Tige respirante, semelle amortissante, finition premium.`,
        priceCents: p.price,
        images: [img(p.seed), img(p.seed + '-2')],
        categoryId: p.cat,
        featured: p.featured,
      },
    })
    for (const size of SIZES) {
      await prisma.productVariant.upsert({
        where: { productId_size: { productId: product.id, size } },
        update: {},
        create: { productId: product.id, size, stock: Math.floor(Math.random() * 8) + 2 },
      })
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vaultkicks.dev'
  const adminPassword = process.env.ADMIN_PASSWORD || 'change-me-now'
  const hash = await bcrypt.hash(adminPassword, 10)
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, name: 'Admin', password: hash, role: 'admin' },
  })

  console.log(`Seed terminé — compte admin: ${adminEmail} / ${adminPassword}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

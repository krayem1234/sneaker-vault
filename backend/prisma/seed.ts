import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SIZES = ['39', '40', '41', '42', '43', '44', '45']

function unsplash(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=1000&q=80&auto=format&fit=crop`
}

async function main() {
  const running = await prisma.category.upsert({
    where: { slug: 'running' },
    update: {},
    create: { name: 'Running', slug: 'running' },
  })
  const trail = await prisma.category.upsert({
    where: { slug: 'trail' },
    update: {},
    create: { name: 'Trail', slug: 'trail' },
  })
  const lifestyle = await prisma.category.upsert({
    where: { slug: 'lifestyle' },
    update: {},
    create: { name: 'Lifestyle', slug: 'lifestyle' },
  })

  const products = [
    {
      name: 'Vault Runner X1', slug: 'vault-runner-x1', price: 12900, cat: running.id, featured: true,
      description: "La silhouette signature de Vault Kicks, pensée pour les sorties quotidiennes comme pour les tempos rapides. Mousse réactive, tige mesh ultra-respirante et maintien du talon renforcé : elle encaisse les kilomètres sans broncher.",
      images: ['1542291026-7eec264c27ff', '1761777939781-2fb1b636d5fc'],
    },
    {
      name: 'Nimbus Flow', slug: 'nimbus-flow', price: 14900, cat: running.id, featured: true,
      description: "Notre modèle le plus amorti, conçu pour absorber chaque impact sur route comme sur piste. La tige tricotée épouse le pied dès les premiers mètres, pour une sensation de chaussette technique.",
      images: ['1606107557195-0e29a4b5b4aa', '1759306188476-99169b6259e3'],
    },
    {
      name: 'Pulse Trainer', slug: 'pulse-trainer', price: 10900, cat: running.id, featured: false,
      description: "Un cross-trainer polyvalent, aussi à l'aise en salle qu'en extérieur. Semelle plate et stable pour les charges, accroche optimale pour les changements de direction.",
      images: ['1595950653106-6c9ebd614d3a', '1525966222134-fcfa99b8ae77'],
    },
    {
      name: 'Aero Sprint', slug: 'aero-sprint', price: 13900, cat: running.id, featured: false,
      description: "Conçue pour la vitesse pure : plaque nervurée intégrée et tige ajourée ultra-légère. Le choix des coureurs qui visent un nouveau record personnel.",
      images: ['1771049873881-45b23a2e9847', '1600269452121-4f2416e55c28'],
    },
    {
      name: 'Horizon Tempo', slug: 'horizon-tempo', price: 11900, cat: running.id, featured: false,
      description: "Le compromis parfait entre confort longue distance et réactivité. Semelle à double densité pour accompagner chaque foulée, du footing du réveil au sprint final.",
      images: ['1777987601471-22def6494460', '1560769629-975ec94e6a86'],
    },
    {
      name: 'Quantum Stride', slug: 'quantum-stride', price: 15900, cat: running.id, featured: false,
      description: "Notre technologie d'amorti la plus avancée, née en labo et validée sur route. Une transition talon-pointe fluide, pensée pour les coureurs exigeants.",
      images: ['1783945345850-82f0b7fd38d3', '1608231387042-66d1773070a5'],
    },
    {
      name: 'Terra Trail', slug: 'terra-trail', price: 16900, cat: trail.id, featured: true,
      description: "Crampons agressifs, tige déperlante et protection anti-roche : Terra Trail a été testée sur les sentiers les plus techniques. Elle ne vous lâche jamais, même sous la pluie.",
      images: ['1600185365483-26d7a4cc7519', '1549298916-b41d501d3772'],
    },
    {
      name: 'Ridge Breaker', slug: 'ridge-breaker', price: 14500, cat: trail.id, featured: false,
      description: "Pensée pour l'altitude et les terrains instables, avec un chassis latéral renforcé qui stabilise la cheville. L'équipement de ceux qui sortent des sentiers battus.",
      images: ['1543508282-6319a3e2621f', '1571008887538-b36bb32f4571'],
    },
    {
      name: 'Summit Grip', slug: 'summit-grip', price: 15500, cat: trail.id, featured: false,
      description: "Semelle à crampons profonds pour une accroche maximale en montée comme en descente. Le compagnon fiable de vos week-ends en montagne.",
      images: ['1600185365926-3a2ce3cdb9eb', '1597892657493-6847b9640bac'],
    },
    {
      name: 'Canyon Trekker', slug: 'canyon-trekker', price: 13500, cat: trail.id, featured: false,
      description: "Un hybride entre chaussure de randonnée et sneaker urbaine, pour ceux qui enchaînent sentier et ville dans la même journée. Robuste, confortable, increvable.",
      images: ['1491553895911-0055eca6402d', '1626379616459-b2ce1d9decbc'],
    },
    {
      name: 'Street Low', slug: 'street-low', price: 9900, cat: lifestyle.id, featured: true,
      description: "Le basique intemporel de la collection : silhouette basse épurée, cuir souple, logo discret. Elle se porte avec tout, tout le temps.",
      images: ['1512374382149-233c42b6a83b', '1597350584914-55bb62285896'],
    },
    {
      name: 'Vault Classic 90', slug: 'vault-classic-90', price: 13900, cat: lifestyle.id, featured: false,
      description: "Un clin d'œil assumé aux running des années 90, revisité avec des matériaux modernes. Volume généreux, empiècements contrastés, superposition de matières : une vraie pièce de collection.",
      images: ['1695073621086-aa692bc32a3d', '1608229751021-ed4bd8677753'],
    },
    {
      name: 'Midnight High', slug: 'midnight-high', price: 15900, cat: lifestyle.id, featured: true,
      description: "Montante, texturée, affirmée : Midnight High habille la cheville avec caractère. Parfaite pour sortir du lot sans forcer.",
      images: ['1544441892-794166f1e3be', '1625860191460-10a66c7384fb'],
    },
    {
      name: 'Chalk Low', slug: 'chalk-low', price: 8900, cat: lifestyle.id, featured: false,
      description: "Minimaliste et polyvalente, Chalk Low mise sur une palette neutre et des lignes nettes. Le sneaker qui s'efface pour mieux s'accorder avec tout le reste.",
      images: ['1562424995-2efe650421dd', '1622760806364-5ccac8096b59'],
    },
    {
      name: 'Retro Court', slug: 'retro-court', price: 12500, cat: lifestyle.id, featured: false,
      description: "Inspirée des silhouettes de tennis vintage, avec une semelle en gomme épaisse et des coutures apparentes. Un hommage au sport qui a lancé la sneaker culture.",
      images: ['1612905468542-585ca599afbc', '1626379625260-7111605463e8'],
    },
    {
      name: 'Urban Glide', slug: 'urban-glide', price: 11500, cat: lifestyle.id, featured: false,
      description: "Légère, souple, pensée pour la marche en ville toute la journée. La tige en mesh technique respire, la semelle absorbe chaque pavé.",
      images: ['1722489291778-cb2a414d6ee0', '1542219550-37153d387c27'],
    },
  ]

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        description: p.description,
        priceCents: p.price,
        images: JSON.stringify(p.images.map(unsplash)),
        categoryId: p.cat,
        featured: p.featured,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceCents: p.price,
        images: JSON.stringify(p.images.map(unsplash)),
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

  console.log(`Seed terminé — ${products.length} produits, compte admin: ${adminEmail} / ${adminPassword}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

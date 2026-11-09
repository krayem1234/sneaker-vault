import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import Stripe from 'stripe'
import { PrismaService } from '../prisma.service'
import { MailService } from '../mail/mail.service'

type CheckoutItem = { productId: string; variantId: string; quantity: number }

@Injectable()
export class OrdersService {
  private stripe: Stripe | null

  constructor(private prisma: PrismaService, private mail: MailService) {
    this.stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
  }

  async checkout(items: CheckoutItem[], email: string, userId?: string) {
    if (!items?.length) throw new BadRequestException('Le panier est vide')
    if (!this.stripe) throw new BadRequestException("Le paiement n'est pas configuré pour le moment")

    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: items.map((i) => i.variantId) } },
      include: { product: true },
    })

    let total = 0
    const orderItemsData: { productId: string; variantId: string; quantity: number; unitPriceCents: number }[] = []
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    for (const it of items) {
      const v = variants.find((x) => x.id === it.variantId && x.productId === it.productId)
      if (!v) throw new BadRequestException('Un des articles du panier est introuvable')
      if (it.quantity < 1) throw new BadRequestException('Quantité invalide')
      if (v.stock < it.quantity) throw new BadRequestException(`Stock insuffisant pour ${v.product.name} (taille ${v.size})`)

      total += v.product.priceCents * it.quantity
      orderItemsData.push({ productId: v.productId, variantId: v.id, quantity: it.quantity, unitPriceCents: v.product.priceCents })
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${v.product.name} — taille ${v.size}`,
            images: v.product.images.slice(0, 1),
          },
          unit_amount: v.product.priceCents,
        },
        quantity: it.quantity,
      })
    }

    const order = await this.prisma.order.create({
      data: { userId: userId ?? null, email, totalCents: total, items: { create: orderItemsData } },
    })

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174'
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: lineItems,
      success_url: `${frontendUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cart`,
      metadata: { orderId: order.id },
    })

    await this.prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } })
    return { url: session.url }
  }

  async confirm(sessionId: string) {
    if (!this.stripe) throw new BadRequestException('Stripe non configuré')
    const session = await this.stripe.checkout.sessions.retrieve(sessionId)
    const orderId = session.metadata?.orderId
    if (!orderId) throw new NotFoundException('Commande introuvable')

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true, variant: true } } },
    })
    if (!order) throw new NotFoundException('Commande introuvable')

    if (order.status === 'pending' && session.payment_status === 'paid') {
      await this.prisma.$transaction([
        this.prisma.order.update({ where: { id: order.id }, data: { status: 'paid' } }),
        ...order.items.map((it) =>
          this.prisma.productVariant.update({ where: { id: it.variantId }, data: { stock: { decrement: it.quantity } } }),
        ),
      ])
      await this.mail.sendOrderConfirmation(order.email, order.id, order.totalCents)
    }

    return this.prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: true, variant: true } } },
    })
  }

  mine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  allForAdmin() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true, variant: true } }, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }
}

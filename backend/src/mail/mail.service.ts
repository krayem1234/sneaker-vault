import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class MailService {
  private logger = new Logger('MailService')
  private apiKey = process.env.RESEND_API_KEY
  private from = process.env.MAIL_FROM || 'Vault Kicks <onboarding@resend.dev>'

  async send(to: string, subject: string, html: string) {
    if (!this.apiKey) {
      this.logger.warn(`[email non envoyé, RESEND_API_KEY non configuré] À: ${to} — ${subject}`)
      return { sent: false }
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: this.from, to, subject, html }),
      })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        this.logger.error(`Échec envoi email à ${to}: ${res.status} ${body}`)
        return { sent: false }
      }
      this.logger.log(`Email envoyé à ${to}: ${subject}`)
      return { sent: true }
    } catch (err) {
      this.logger.error(`Échec envoi email à ${to}`, err as Error)
      return { sent: false }
    }
  }

  async sendPasswordReset(to: string, resetLink: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#111;">Vault Kicks</h2>
        <p style="color:#333; font-size: 15px; line-height: 1.6;">
          Tu as demandé à réinitialiser ton mot de passe (valable 1 heure). Si ce n'est pas toi, ignore cet email.
        </p>
        <a href="${resetLink}" style="display:inline-block; margin-top:12px; background:#111; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600;">
          Réinitialiser mon mot de passe
        </a>
      </div>
    `
    return this.send(to, 'Réinitialisation de ton mot de passe', html)
  }

  async sendOrderConfirmation(to: string, orderId: string, totalCents: number) {
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#111;">Merci pour ta commande 🎉</h2>
        <p style="color:#333; font-size: 15px; line-height: 1.6;">
          Commande <strong>#${orderId.slice(-8).toUpperCase()}</strong> confirmée — total ${(totalCents / 100).toFixed(2)} €.
        </p>
      </div>
    `
    return this.send(to, 'Confirmation de commande — Vault Kicks', html)
  }

  async sendOrderStatusUpdate(to: string, orderId: string, status: string) {
    const label = status === 'shipped' ? 'expédiée 📦' : status === 'cancelled' ? 'annulée' : status === 'paid' ? 'payée' : 'en attente'
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#111;">Mise à jour de ta commande</h2>
        <p style="color:#333; font-size: 15px; line-height: 1.6;">
          Ta commande <strong>#${orderId.slice(-8).toUpperCase()}</strong> est maintenant <strong>${label}</strong>.
        </p>
      </div>
    `
    return this.send(to, `Commande #${orderId.slice(-8).toUpperCase()} — ${label}`, html)
  }

  async sendBackInStock(to: string, productName: string, size: string, productUrl: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#111;">De retour en stock 🙌</h2>
        <p style="color:#333; font-size: 15px; line-height: 1.6;">
          <strong>${productName}</strong> (taille ${size}) est de nouveau disponible — les stocks sont limités.
        </p>
        <a href="${productUrl}" style="display:inline-block; margin-top:12px; background:#ff5a1f; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600;">
          Voir le produit
        </a>
      </div>
    `
    return this.send(to, `${productName} est de nouveau en stock`, html)
  }
}

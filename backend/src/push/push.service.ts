import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PushService {
  constructor(private prisma: PrismaService) {}

  async registerToken(userId: string, token: string, platform?: string) {
    await this.prisma.pushToken.upsert({
      where: { token },
      update: { userId, platform },
      create: { userId, token, platform },
    })
    return { ok: true }
  }

  async sendToEmail(email: string, title: string, body: string, data?: Record<string, any>) {
    const user = await this.prisma.user.findUnique({ where: { email }, include: { pushTokens: true } })
    if (!user || !user.pushTokens.length) return
    await this.sendPush(user.pushTokens.map((t) => t.token), title, body, data)
  }

  async sendPush(tokens: string[], title: string, body: string, data?: Record<string, any>) {
    if (!tokens.length) return
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(tokens.map((to) => ({ to, title, body, data, sound: 'default' }))),
      })
    } catch {
      // best-effort: une erreur d'envoi push ne doit jamais casser le flux principal
    }
  }
}

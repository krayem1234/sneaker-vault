import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as crypto from 'crypto'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma.service'
import { MailService } from '../mail/mail.service'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private mail: MailService) {}

  async register(email: string, name: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) throw new ConflictException('Un compte existe déjà avec cet email')
    const hash = await bcrypt.hash(password, 10)
    const user = await this.prisma.user.create({ data: { email, name, password: hash } })
    return this.signToken(user.id, user.email, user.name, user.role)
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new UnauthorizedException('Identifiants invalides')
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new UnauthorizedException('Identifiants invalides')
    return this.signToken(user.id, user.email, user.name, user.role)
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) return { ok: true }
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await this.prisma.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } })
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174'
    await this.mail.sendPasswordReset(email, `${frontendUrl}/reset-password?token=${token}`)
    return { ok: true }
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { token } })
    if (!record || record.used || record.expiresAt < new Date()) {
      throw new BadRequestException('Ce lien de réinitialisation est invalide ou a expiré')
    }
    const hash = await bcrypt.hash(newPassword, 10)
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { password: hash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    ])
    return { ok: true }
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    if (data.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } })
      if (existing && existing.id !== userId) throw new ConflictException('Cet email est déjà utilisé par un autre compte')
    }
    const user = await this.prisma.user.update({ where: { id: userId }, data })
    return this.signToken(user.id, user.email, user.name, user.role)
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new UnauthorizedException('Utilisateur introuvable')
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) throw new BadRequestException('Mot de passe actuel incorrect')
    const hash = await bcrypt.hash(newPassword, 10)
    await this.prisma.user.update({ where: { id: userId }, data: { password: hash } })
    return { ok: true }
  }

  private signToken(sub: string, email: string, name: string, role: string) {
    const token = this.jwt.sign({ sub, email, role })
    return { token, user: { id: sub, email, name, role } }
  }
}

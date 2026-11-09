import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { AuthModule } from '../auth/auth.module'
import { MailModule } from '../mail/mail.module'
import { PromoCodesModule } from '../promo-codes/promo-codes.module'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'

@Module({
  imports: [AuthModule, MailModule, PromoCodesModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
})
export class OrdersModule {}

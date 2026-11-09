import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { AuthModule } from '../auth/auth.module'
import { MailModule } from '../mail/mail.module'
import { PushModule } from '../push/push.module'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
  imports: [AuthModule, MailModule, PushModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
})
export class ProductsModule {}

import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { AuthModule } from '../auth/auth.module'
import { PromoCodesController } from './promo-codes.controller'
import { PromoCodesService } from './promo-codes.service'

@Module({
  imports: [AuthModule],
  controllers: [PromoCodesController],
  providers: [PromoCodesService, PrismaService],
  exports: [PromoCodesService],
})
export class PromoCodesModule {}

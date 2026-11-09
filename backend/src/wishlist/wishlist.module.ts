import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { AuthModule } from '../auth/auth.module'
import { WishlistController } from './wishlist.controller'
import { WishlistService } from './wishlist.service'

@Module({
  imports: [AuthModule],
  controllers: [WishlistController],
  providers: [WishlistService, PrismaService],
})
export class WishlistModule {}

import { Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { AuthModule } from './auth/auth.module'
import { CategoriesModule } from './categories/categories.module'
import { ProductsModule } from './products/products.module'
import { OrdersModule } from './orders/orders.module'
import { ReviewsModule } from './reviews/reviews.module'
import { WishlistModule } from './wishlist/wishlist.module'
import { PromoCodesModule } from './promo-codes/promo-codes.module'
import { AddressesModule } from './addresses/addresses.module'
import { PushModule } from './push/push.module'

@Module({
  imports: [AuthModule, CategoriesModule, ProductsModule, OrdersModule, ReviewsModule, WishlistModule, PromoCodesModule, AddressesModule, PushModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}

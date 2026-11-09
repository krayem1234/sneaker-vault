import { Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { AuthModule } from './auth/auth.module'
import { CategoriesModule } from './categories/categories.module'
import { ProductsModule } from './products/products.module'
import { OrdersModule } from './orders/orders.module'

@Module({
  imports: [AuthModule, CategoriesModule, ProductsModule, OrdersModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}

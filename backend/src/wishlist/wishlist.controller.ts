import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { WishlistService } from './wishlist.service'

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlist: WishlistService) {}

  @Get()
  list(@Req() req: any) {
    return this.wishlist.list(req.user.sub)
  }

  @Post(':productId')
  add(@Param('productId') productId: string, @Req() req: any) {
    return this.wishlist.add(req.user.sub, productId)
  }

  @Delete(':productId')
  remove(@Param('productId') productId: string, @Req() req: any) {
    return this.wishlist.remove(req.user.sub, productId)
  }
}

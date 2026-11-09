import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { IsArray, IsEmail, IsInt, IsString, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OptionalAuthGuard } from '../auth/optional-auth.guard'
import { AdminGuard } from '../common/roles.guard'
import { OrdersService } from './orders.service'

class CheckoutItemDto {
  @IsString() productId: string
  @IsString() variantId: string
  @IsInt() @Min(1) quantity: number
}

class CheckoutDto {
  @IsEmail() email: string
  @IsArray() @ValidateNested({ each: true }) @Type(() => CheckoutItemDto) items: CheckoutItemDto[]
}

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @UseGuards(OptionalAuthGuard)
  @Post('checkout')
  checkout(@Req() req: any, @Body() dto: CheckoutDto) {
    return this.orders.checkout(dto.items, dto.email, req.user?.sub)
  }

  @Get('confirm')
  confirm(@Query('session_id') sessionId: string) {
    return this.orders.confirm(sessionId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@Req() req: any) {
    return this.orders.mine(req.user.sub)
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  all() {
    return this.orders.allForAdmin()
  }
}

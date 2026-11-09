import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { IsArray, IsEmail, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator'
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
  @IsOptional() @IsString() promoCode?: string
}

class UpdateStatusDto {
  @IsIn(['pending', 'paid', 'shipped', 'cancelled']) status: 'pending' | 'paid' | 'shipped' | 'cancelled'
}

@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @UseGuards(OptionalAuthGuard)
  @Post('checkout')
  checkout(@Req() req: any, @Body() dto: CheckoutDto) {
    return this.orders.checkout(dto.items, dto.email, req.user?.sub, dto.promoCode)
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
  @Get('export.csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.orders.exportCsv()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="commandes.csv"')
    res.send(csv)
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  all() {
    return this.orders.allForAdmin()
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.orders.updateStatus(id, dto.status)
  }
}

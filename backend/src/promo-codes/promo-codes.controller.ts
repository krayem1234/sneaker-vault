import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AdminGuard } from '../common/roles.guard'
import { PromoCodesService } from './promo-codes.service'

class CreatePromoDto {
  @IsString() @MinLength(2) code: string
  @IsInt() @Min(1) @Max(90) percentOff: number
  @IsOptional() @IsString() expiresAt?: string
}

class UpdatePromoDto {
  @IsBoolean() active: boolean
}

@Controller('promo-codes')
export class PromoCodesController {
  constructor(private promos: PromoCodesService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  list() {
    return this.promos.list()
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreatePromoDto) {
    return this.promos.create(dto.code, dto.percentOff, dto.expiresAt)
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  setActive(@Param('id') id: string, @Body() dto: UpdatePromoDto) {
    return this.promos.setActive(id, dto.active)
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promos.remove(id)
  }

  @Get('validate/:code')
  async validate(@Param('code') code: string) {
    const promo = await this.promos.validate(code)
    return { code: promo.code, percentOff: promo.percentOff }
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AdminGuard } from '../common/roles.guard'
import { ProductsService } from './products.service'

class SizeDto {
  @IsString() size: string
  @IsInt() @Min(0) stock: number
}

class CreateProductDto {
  @IsString() @MinLength(1) name: string
  @IsString() @MinLength(1) slug: string
  @IsString() description: string
  @IsInt() @Min(0) priceCents: number
  @IsArray() images: string[]
  @IsString() categoryId: string
  @IsOptional() @IsBoolean() featured?: boolean
  @IsArray() @ValidateNested({ each: true }) @Type(() => SizeDto) sizes: SizeDto[]
}

class UpdateProductDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsInt() @Min(0) priceCents?: number
  @IsOptional() @IsArray() images?: string[]
  @IsOptional() @IsString() categoryId?: string
  @IsOptional() @IsBoolean() featured?: boolean
}

class SetStockDto {
  @IsInt() @Min(0) stock: number
}

class AddVariantDto {
  @IsString() size: string
  @IsInt() @Min(0) stock: number
}

@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  list(@Query('category') category?: string, @Query('featured') featured?: string) {
    return this.products.list(category, featured === 'true')
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  listAllForAdmin() {
    return this.products.listAllForAdmin()
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.products.bySlug(slug)
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto)
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(id, dto)
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.products.remove(id)
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/variants/:variantId')
  setStock(@Param('id') id: string, @Param('variantId') variantId: string, @Body() dto: SetStockDto) {
    return this.products.setStock(id, variantId, dto.stock)
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/variants')
  addVariant(@Param('id') id: string, @Body() dto: AddVariantDto) {
    return this.products.addVariant(id, dto.size, dto.stock)
  }
}

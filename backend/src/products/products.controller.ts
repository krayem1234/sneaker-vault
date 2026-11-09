import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage, memoryStorage } from 'multer'
import { extname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AdminGuard } from '../common/roles.guard'
import { ProductsService } from './products.service'

const UPLOAD_DIR = join(process.cwd(), 'uploads')
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true })

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

class NotifyMeDto {
  @IsString() size: string
  @IsEmail() email: string
}

@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  list(
    @Query('category') category?: string,
    @Query('featured') featured?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sort') sort?: 'newest' | 'price_asc' | 'price_desc' | 'name',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.products.list({
      categorySlug: category,
      featured: featured === 'true',
      search: search?.trim() || undefined,
      minPriceCents: minPrice ? Math.round(parseFloat(minPrice) * 100) : undefined,
      maxPriceCents: maxPrice ? Math.round(parseFloat(maxPrice) * 100) : undefined,
      sort,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    })
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/all')
  listAllForAdmin() {
    return this.products.listAllForAdmin()
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(png|jpe?g|webp|gif|avif)$/.test(file.mimetype)) return cb(new BadRequestException('Seules les images sont acceptées'), false)
        cb(null, true)
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu')
    return { url: `/uploads/${file.filename}` }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('export.csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.products.exportCsv()
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="produits.csv"')
    res.send(csv)
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

  @Post(':id/notify-me')
  notifyMe(@Param('id') id: string, @Body() dto: NotifyMeDto) {
    return this.products.notifyMe(id, dto.size, dto.email)
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('import-stock')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } }))
  async importStock(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu')
    return this.products.importStockCsv(file.buffer.toString('utf-8'))
  }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { IsString, MinLength } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AdminGuard } from '../common/roles.guard'
import { CategoriesService } from './categories.service'

class CreateCategoryDto {
  @IsString() @MinLength(1) name: string
  @IsString() @MinLength(1) slug: string
}

@Controller('categories')
export class CategoriesController {
  constructor(private categories: CategoriesService) {}

  @Get()
  list() {
    return this.categories.list()
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categories.create(dto.name, dto.slug)
  }
}

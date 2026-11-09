import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { IsInt, IsString, Max, Min, MinLength } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ReviewsService } from './reviews.service'

class ReviewDto {
  @IsInt() @Min(1) @Max(5) rating: number
  @IsString() @MinLength(1) comment: string
}

@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Get()
  list(@Param('productId') productId: string) {
    return this.reviews.list(productId)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  upsert(@Param('productId') productId: string, @Req() req: any, @Body() dto: ReviewDto) {
    return this.reviews.upsert(productId, req.user.sub, dto.rating, dto.comment)
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  remove(@Param('productId') productId: string, @Req() req: any) {
    return this.reviews.remove(productId, req.user.sub)
  }
}

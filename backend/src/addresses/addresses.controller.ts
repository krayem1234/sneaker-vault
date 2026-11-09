import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AddressesService } from './addresses.service'

class AddressDto {
  @IsOptional() @IsString() label?: string
  @IsString() @MinLength(1) fullName: string
  @IsString() @MinLength(1) line1: string
  @IsOptional() @IsString() line2?: string
  @IsString() @MinLength(1) city: string
  @IsString() @MinLength(1) zip: string
  @IsOptional() @IsString() country?: string
  @IsOptional() @IsBoolean() isDefault?: boolean
}

class UpdateAddressDto {
  @IsOptional() @IsString() label?: string
  @IsOptional() @IsString() fullName?: string
  @IsOptional() @IsString() line1?: string
  @IsOptional() @IsString() line2?: string
  @IsOptional() @IsString() city?: string
  @IsOptional() @IsString() zip?: string
  @IsOptional() @IsString() country?: string
  @IsOptional() @IsBoolean() isDefault?: boolean
}

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private addresses: AddressesService) {}

  @Get()
  list(@Req() req: any) {
    return this.addresses.list(req.user.sub)
  }

  @Post()
  create(@Req() req: any, @Body() dto: AddressDto) {
    return this.addresses.create(req.user.sub, dto)
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.addresses.update(req.user.sub, id, dto)
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.addresses.remove(req.user.sub, id)
  }
}

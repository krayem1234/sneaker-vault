import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { IsOptional, IsString } from 'class-validator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PushService } from './push.service'

class RegisterPushTokenDto {
  @IsString() token: string
  @IsOptional() @IsString() platform?: string
}

@UseGuards(JwtAuthGuard)
@Controller('push-tokens')
export class PushController {
  constructor(private push: PushService) {}

  @Post()
  register(@Req() req: any, @Body() dto: RegisterPushTokenDto) {
    return this.push.registerToken(req.user.sub, dto.token, dto.platform)
  }
}

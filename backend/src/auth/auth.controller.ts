import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'

class RegisterDto {
  @IsEmail() email: string
  @IsString() @MinLength(2) name: string
  @IsString() @MinLength(6) password: string
}
class LoginDto {
  @IsEmail() email: string
  @IsString() password: string
}
class ForgotPasswordDto {
  @IsEmail() email: string
}
class ResetPasswordDto {
  @IsString() token: string
  @IsString() @MinLength(6) password: string
}
class UpdateProfileDto {
  @IsOptional() @IsString() @MinLength(2) name?: string
  @IsOptional() @IsEmail() email?: string
}
class ChangePasswordDto {
  @IsString() currentPassword: string
  @IsString() @MinLength(6) newPassword: string
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.name, dto.password)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password)
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email)
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.password)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(req.user.sub, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(req.user.sub, dto.currentPassword, dto.newPassword)
  }
}

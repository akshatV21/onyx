import { Body, Controller, Post, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dtos/register.dto'
import { HttpResponse } from 'src/utils/types'
import { Response } from 'express'
import { Auth } from './decorators/auth.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Auth({ isOpen: true })
  async httpRegister(@Body() data: RegisterDto, @Res() res: Response): HttpResponse {
    const tokens = await this.authService.register(data)
    this.setRefreshToken(res, tokens.refresh)

    return { success: true, data: { access: tokens.access } }
  }

  @Post('login')
  @Auth({ isOpen: true })
  async httpLogin(@Body() data: RegisterDto, @Res() res: Response): HttpResponse {
    const tokens = await this.authService.login(data)
    this.setRefreshToken(res, tokens.refresh)

    return { success: true, data: { access: tokens.access } }
  }

  private setRefreshToken(res: Response, refresh: string) {
    res.cookie('refreshToken', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  }
}

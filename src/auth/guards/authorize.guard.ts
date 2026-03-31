import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { verify } from 'jsonwebtoken'
import { AUTH_OPTIONS_KEY } from 'src/utils/constants'
import { AuthOptions } from 'src/utils/types'
import { InvalidTokenError, NoAuthHeaderError, NoRefreshTokenError, TokenExpiredError } from '../auth.errors'
import { Request } from 'express'

@Injectable()
export class Authorize implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const { isOpen, refresh } = this.reflector.get<AuthOptions>(AUTH_OPTIONS_KEY, context.getHandler())
    if (isOpen) return true

    return refresh ? this.refresh(request) : this.access(request)
  }

  async access(request: any) {
    const authHeader = request.headers.authorization
    if (!authHeader) throw new NoAuthHeaderError()

    const token = authHeader.split(' ')[1]
    const user = Authorize.validateToken(token, this.config.getOrThrow('JWT_ACCESS_SECRET'))

    request.user = user
    return true
  }

  async refresh(request: any) {
    const refresh = request.cookies['refresh']
    if (!refresh) throw new NoRefreshTokenError()

    const user = Authorize.validateToken(refresh, this.config.getOrThrow('JWT_REFRESH_SECRET'))

    request.user = user
    request.refresh = refresh

    return true
  }

  static validateToken(token: string, secret: string): any {
    return verify(token, secret, (err, payload) => {
      // when jwt is valid
      if (!err) return payload

      // when jwt has expired
      if (err.name === 'TokenExpiredError') throw new TokenExpiredError()

      // throws error when jwt is malformed
      throw new InvalidTokenError()
    })
  }
}

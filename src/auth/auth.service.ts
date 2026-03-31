import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { RegisterDto } from './dtos/register.dto'
import { UNIQUE_ERR_CODE } from 'src/utils/constants'
import { UnqiueUsernameError } from './auth.errors'
import { JwtService } from '@nestjs/jwt'
import { hash, hashSync } from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const user = await this.db.user
      .create({ data: { username: data.username, password: hashSync(data.password, 10) } })
      .catch(err => {
        if (err.code === UNIQUE_ERR_CODE) throw new UnqiueUsernameError()
        throw err
      })

    const tokens = await this.generateTokens(user.id)
    await this.updateRefreshToken(user.id, tokens.refresh)

    return tokens
  }

  private async generateTokens(userId: string) {
    const payload = { id: userId }

    const [access, refresh] = await Promise.all([
      this.jwt.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' }),
      this.jwt.signAsync(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' }),
    ])

    return { access, refresh }
  }

  private async updateRefreshToken(userId: string, refresh: string) {
    await this.db.user.update({ where: { id: userId }, data: { refresh: hashSync(refresh, 10) } })
  }
}

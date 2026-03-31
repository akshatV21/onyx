import { BadRequestException } from '@nestjs/common'

export class UnqiueUsernameError extends BadRequestException {
  constructor() {
    super({ error: 'UniqueUsernameError' })
  }
}

export class InvalidCredentialsError extends BadRequestException {
  constructor() {
    super({ error: 'InvalidCredentialsError' })
  }
}

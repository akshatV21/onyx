import { BadRequestException } from '@nestjs/common'

export class ProjectNotFoundError extends BadRequestException {
  constructor() {
    super({ error: 'ProjectNotFound' })
  }
}

import { BadRequestException } from '@nestjs/common'

export class CannotModifyProjectError extends BadRequestException {
  constructor() {
    super({ error: 'CannotModifyProject' })
  }
}

export class CannotModifyFeatureError extends BadRequestException {
  constructor() {
    super({ error: 'CannotModifyFeature' })
  }
}

export class FeatureNotFoundError extends BadRequestException {
  constructor() {
    super({ error: 'FeatureNotFound' })
  }
}

export class TaskNotFoundError extends BadRequestException {
  constructor() {
    super({ error: 'TaskNotFound' })
  }
}

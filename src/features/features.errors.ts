import { BadRequestException } from '@nestjs/common'

export class ProjectNotFoundError extends BadRequestException {
  constructor() {
    super({ error: 'ProjectNotFound' })
  }
}

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

import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateFeatureDto } from './dtos/create-feature.dto'
import { CannotModifyProjectError, ProjectNotFoundError } from './features.errors'
import { User } from 'src/utils/types'

@Injectable()
export class FeaturesService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateFeatureDto, user: User) {
    const project = await this.db.project.findUnique({
      where: { id: data.projectId, userId: user.id },
      select: { status: true },
    })

    if (!project) throw new ProjectNotFoundError()
    if (project.status === 'archived' || project.status === 'completed') throw new CannotModifyProjectError()

    const feature = await this.db.$transaction(async txn => {
      const feature = await txn.feature.create({ data })
      await txn.featureStats.create({ data: { featureId: feature.id } })

      return feature
    })

    return feature
  }
}

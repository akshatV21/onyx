import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateFeatureDto } from './dtos/create-feature.dto'
import { CannotModifyProjectError, FeatureNotFoundError, ProjectNotFoundError } from './features.errors'
import { User } from 'src/utils/types'
import { QueryFeaturesDto } from './dtos/query-features.dto'
import { UpdateFeaturePriorityDto } from './dtos/update-priority.dto'
import { UpdateFeatureStatusDto } from './dtos/update-status.dto'

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

      await Promise.all([
        txn.featureStats.create({ data: { featureId: feature.id } }),
        txn.projectStats.update({
          where: { projectId: data.projectId },
          data: { ftotal: { increment: 1 }, fplanned: { increment: 1 } },
        }),
      ])

      return feature
    })

    return feature
  }

  async list(query: QueryFeaturesDto, user: User) {
    const limit = query.limit ?? 10

    const project = await this.db.project.findUnique({
      where: { id: query.projectId, userId: user.id },
      select: { id: true },
    })

    if (!project) throw new ProjectNotFoundError()

    const features = await this.db.feature.findMany({
      where: { projectId: query.projectId, status: query.status },
      cursor: query.cursor ? { id: query.cursor } : undefined,
      take: limit + 1,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: { stats: { omit: { id: true, featureId: true } } },
    })

    let cursor: string | null = null

    if (features.length > limit) {
      const next = features.pop()!
      cursor = next.id
    }

    return { features, cursor }
  }

  async priority(data: UpdateFeaturePriorityDto, user: User) {
    const feature = await this.db.feature.findUnique({
      where: { id: data.featureId },
      select: { project: { select: { userId: true } } },
    })

    if (!feature || feature.project.userId !== user.id) throw new FeatureNotFoundError()

    await this.db.feature.update({ where: { id: data.featureId }, data: { priority: data.priority } })
  }

  async status(data: UpdateFeatureStatusDto, user: User) {
    const feature = await this.db.feature.findUnique({
      where: { id: data.featureId },
      select: { status: true, project: { select: { id: true, userId: true } } },
    })

    if (!feature || feature.project.userId !== user.id) throw new FeatureNotFoundError()

    await this.db.$transaction([
      this.db.feature.update({ where: { id: data.featureId }, data: { status: data.status } }),
      this.db.projectStats.update({
        where: { projectId: feature.project.id },
        data: { [`f${data.status}`]: { increment: 1 }, [`f${feature.status}`]: { decrement: 1 } },
      }),
    ])
  }
}

import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateTaskDto } from './dtos/create-task.dto'
import { User } from 'src/utils/types'
import { CannotModifyProjectError, FeatureNotFoundError } from './tasks.errors'

@Injectable()
export class TasksService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateTaskDto, user: User) {
    const feature = await this.db.feature.findUnique({
      where: { id: data.featureId },
      select: { status: true, project: { select: { id: true, status: true, userId: true } } },
    })

    if (!feature || feature.status === 'completed' || feature.project.userId !== user.id)
      throw new FeatureNotFoundError()

    if (
      feature.project.status === 'completed' ||
      feature.project.status === 'paused' ||
      feature.project.status === 'archived'
    ) {
      throw new CannotModifyProjectError()
    }

    const [task] = await this.db.$transaction([
      this.db.task.create({ data: { ...data, projectId: feature.project.id } }),
      this.db.projectStats.update({
        where: { projectId: feature.project.id },
        data: { ttotal: { increment: 1 }, ttodo: { increment: 1 } },
      }),
      this.db.featureStats.update({
        where: { featureId: data.featureId },
        data: { ttotal: { increment: 1 }, ttodo: { increment: 1 } },
      }),
    ])

    return task
  }
}

import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateTaskDto } from './dtos/create-task.dto'
import { User } from 'src/utils/types'
import {
  CannotModifyFeatureError,
  CannotModifyProjectError,
  FeatureNotFoundError,
  TaskNotFoundError,
} from './tasks.errors'
import { QueryTasksDto } from './dtos/query-tasks.dto'
import { FeatureStatus, ProjectStatus, TaskStatus } from 'generated/prisma/enums'
import { featureIsLocked, projectIsLocked } from 'src/utils/functions'

@Injectable()
export class TasksService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateTaskDto, user: User) {
    const feature = await this.db.feature.findUnique({
      where: { id: data.featureId },
      select: { status: true, project: { select: { id: true, status: true, userId: true } } },
    })

    if (!feature || feature.project.userId !== user.id) throw new FeatureNotFoundError()
    if (projectIsLocked(feature.project.status)) throw new CannotModifyProjectError()
    if (featureIsLocked(feature.status)) throw new CannotModifyFeatureError()

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

  async list(query: QueryTasksDto, user: User) {
    const feature = await this.db.feature.findUnique({
      where: { id: query.featureId },
      select: { project: { select: { userId: true } } },
    })

    if (!feature || feature.project.userId !== user.id) throw new FeatureNotFoundError()

    const limit = query.limit ?? 20

    const tasks = await this.db.task.findMany({
      where: { featureId: query.featureId },
      cursor: query.cursor ? { id: query.cursor } : undefined,
      take: limit + 1,
      orderBy: [{ status: 'asc' }, { updatedAt: 'asc' }],
    })

    let cursor: string | null = null
    if (tasks.length > limit) {
      const next = tasks.pop()!
      cursor = next.id
    }

    return { tasks, cursor }
  }

  async delete(taskId: string, user: User) {
    const task = await this.db.task.findUnique({
      where: { id: taskId },
      select: {
        feature: { select: { id: true, status: true } },
        project: { select: { id: true, userId: true, status: true } },
        status: true,
      },
    })

    if (!task || task.project.userId !== user.id) throw new TaskNotFoundError()
    if (projectIsLocked(task.project.status)) throw new CannotModifyProjectError()
    if (featureIsLocked(task.feature.status)) throw new CannotModifyProjectError()

    const completed = task.status === TaskStatus.completed
    const data = {
      ttotal: { decrement: 1 },
      ttodo: completed ? undefined : { decrement: 1 },
      tcompleted: completed ? { decrement: 1 } : undefined,
    }

    await this.db.$transaction([
      this.db.task.delete({ where: { id: taskId } }),
      this.db.projectStats.update({ where: { projectId: task.project.id }, data }),
      this.db.featureStats.update({ where: { featureId: task.feature.id }, data }),
    ])
  }
}

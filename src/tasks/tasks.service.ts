import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateTaskDto } from './dtos/create-task.dto'
import { User } from 'src/utils/types'
import { CannotModifyProjectError, FeatureNotFoundError, TaskNotFoundError } from './tasks.errors'
import { QueryTasksDto } from './dtos/query-tasks.dto'
import { ProjectStatus, TaskStatus } from 'generated/prisma/enums'

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

  async list(query: QueryTasksDto, user: User) {
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
      select: { featureId: true, project: { select: { id: true, userId: true, status: true } }, status: true },
    })

    if (!task || task.project.userId !== user.id) throw new TaskNotFoundError()
    if (task.project.status !== ProjectStatus.planning && task.project.status !== ProjectStatus.active)
      throw new CannotModifyProjectError()

    const completed = task.status === TaskStatus.completed
    const data = {
      ttotal: { decrement: 1 },
      ttodo: completed ? undefined : { decrement: 1 },
      tcompleted: completed ? { decrement: 1 } : undefined,
    }

    await this.db.$transaction([
      this.db.task.delete({ where: { id: taskId } }),
      this.db.projectStats.update({ where: { projectId: task.project.id }, data }),
      this.db.featureStats.update({ where: { featureId: task.featureId }, data }),
    ])
  }
}

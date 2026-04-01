import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateProjectDto } from './dtos/create-project.dto'
import { User } from 'src/utils/types'
import { QueryProjectsDto } from './dtos/query-projects.dto'
import { ProjectStatus } from 'generated/prisma/enums'

@Injectable()
export class ProjectsService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateProjectDto, user: User) {
    const project = await this.db.project.create({
      data: { title: data.title, description: data.description, userId: user.id },
    })

    return project
  }

  async list(query: QueryProjectsDto, user: User) {
    const limit = query.limit ?? 10
    const status = query.status ?? ProjectStatus.active

    const projects = await this.db.project.findMany({
      where: { userId: user.id, status },
      cursor: query.cursor ? { id: query.cursor } : undefined,
      take: limit + 1,
      orderBy: { updatedAt: 'desc' },
    })

    let cursor: string | null = null

    if (projects.length > limit) {
      const next = projects.pop()!
      cursor = next.id
    }

    return { projects, cursor }
  }
}

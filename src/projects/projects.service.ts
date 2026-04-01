import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateProjectDto } from './dtos/create-project.dto'
import { User } from 'src/utils/types'

@Injectable()
export class ProjectsService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateProjectDto, user: User) {
    const project = await this.db.project.create({
      data: { title: data.title, description: data.description, userId: user.id },
    })

    return project
  }
}

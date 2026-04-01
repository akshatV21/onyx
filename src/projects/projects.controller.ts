import { Body, Controller, Post } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateProjectDto } from './dtos/create-project.dto'
import { AuthUser } from 'src/auth/decorators/auth-user.decorator'
import { HttpResponse, User } from 'src/utils/types'

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('create')
  @Auth()
  async httpCreateProject(@Body() data: CreateProjectDto, @AuthUser() user: User): HttpResponse {
    const project = await this.projectsService.create(data, user)
    return { success: true, data: { project } }
  }
}

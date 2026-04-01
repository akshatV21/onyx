import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateProjectDto } from './dtos/create-project.dto'
import { AuthUser } from 'src/auth/decorators/auth-user.decorator'
import { HttpResponse, User } from 'src/utils/types'
import { QueryProjectsDto } from './dtos/query-projects.dto'

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('create')
  @Auth()
  async httpCreateProject(@Body() data: CreateProjectDto, @AuthUser() user: User): HttpResponse {
    const project = await this.projectsService.create(data, user)
    return { success: true, data: { project } }
  }

  @Get('list')
  @Auth()
  async httpListProjects(@Query() query: QueryProjectsDto, @AuthUser() user: User) {
    const result = await this.projectsService.list(query, user)
    return { success: true, data: result }
  }
}

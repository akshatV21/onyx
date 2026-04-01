import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateProjectDto } from './dtos/create-project.dto'
import { AuthUser } from 'src/auth/decorators/auth-user.decorator'
import { HttpResponse, User } from 'src/utils/types'
import { QueryProjectsDto } from './dtos/query-projects.dto'
import { UpdateProjectStatusDto } from './dtos/update-project-status.dto'

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

  @Get(':id')
  @Auth()
  async httpGetProject(@Query('id') projectId: string, @AuthUser() user: User) {
    const project = await this.projectsService.get(projectId, user)
    return { success: true, data: { project } }
  }

  @Patch('status')
  @Auth()
  async httpUpdateProjectStatus(@Body() data: UpdateProjectStatusDto, @AuthUser() user: User) {
    await this.projectsService.status(data, user)
    return { success: true }
  }
}

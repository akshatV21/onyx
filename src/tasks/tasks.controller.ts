import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateTaskDto } from './dtos/create-task.dto'
import { AuthUser } from 'src/auth/decorators/auth-user.decorator'
import { HttpResponse, User } from 'src/utils/types'
import { QueryTasksDto } from './dtos/query-tasks.dto'

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('create')
  @Auth()
  async httpCreateTask(@Body() data: CreateTaskDto, @AuthUser() user: User): HttpResponse {
    const task = await this.tasksService.create(data, user)
    return { success: true, data: { task } }
  }

  @Get('list')
  @Auth()
  async httpListTasks(@Query() query: QueryTasksDto, @AuthUser() user: User): HttpResponse {
    const result = await this.tasksService.list(query, user)
    return { success: true, data: result }
  }

  @Delete(':id')
  @Auth()
  async httpDeleteTask(@Param('id') taskId: string, @AuthUser() user: User): HttpResponse {
    await this.tasksService.delete(taskId, user)
    return { success: true }
  }
}

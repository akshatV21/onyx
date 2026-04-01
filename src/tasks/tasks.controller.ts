import { Body, Controller, Post } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateTaskDto } from './dtos/create-task.dto'
import { AuthUser } from 'src/auth/decorators/auth-user.decorator'
import { HttpResponse, User } from 'src/utils/types'

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('create')
  @Auth()
  async httpCreateTask(@Body() data: CreateTaskDto, @AuthUser() user: User): HttpResponse {
    const task = await this.tasksService.create(data, user)
    return { success: true, data: { task } }
  }
}

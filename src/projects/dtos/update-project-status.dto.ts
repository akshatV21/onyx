import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { ProjectStatus } from 'generated/prisma/enums'

export class UpdateProjectStatusDto {
  @IsNotEmpty()
  @IsString()
  projectId: string

  @IsNotEmpty()
  @IsEnum(ProjectStatus)
  status: ProjectStatus
}

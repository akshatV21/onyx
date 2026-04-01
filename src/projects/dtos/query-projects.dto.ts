import { IsEnum, IsOptional } from 'class-validator'
import { ProjectStatus } from 'generated/prisma/enums'
import { CursorPaginationDto } from 'src/utils/pagination'

export class QueryProjectsDto extends CursorPaginationDto {
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus
}

import { IsNotEmpty, IsString } from 'class-validator'
import { CursorPaginationDto } from 'src/utils/pagination'

export class QueryTasksDto extends CursorPaginationDto {
  @IsNotEmpty()
  @IsString()
  featureId: string
}

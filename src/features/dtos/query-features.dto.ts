import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { FeatureStatus } from 'generated/prisma/enums'
import { CursorPaginationDto } from 'src/utils/pagination'

export class QueryFeaturesDto extends CursorPaginationDto {
  @IsNotEmpty()
  @IsString()
  projectId: string

  @IsOptional()
  @IsEnum(FeatureStatus)
  status?: FeatureStatus
}

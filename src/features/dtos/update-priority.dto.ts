import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { FeaturePriority } from 'generated/prisma/enums'

export class UpdateFeaturePriorityDto {
  @IsNotEmpty()
  @IsString()
  featureId: string

  @IsNotEmpty()
  @IsEnum(FeaturePriority)
  priority: FeaturePriority
}

import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { FeatureStatus } from 'generated/prisma/enums'

export class UpdateFeatureStatusDto {
  @IsNotEmpty()
  @IsString()
  featureId: string

  @IsNotEmpty()
  @IsEnum(FeatureStatus)
  status: FeatureStatus
}

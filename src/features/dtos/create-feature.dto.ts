import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { FeaturePriority } from 'generated/prisma/enums'

export class CreateFeatureDto {
  @IsNotEmpty()
  @IsString()
  projectId: string

  @IsNotEmpty()
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsEnum(FeaturePriority)
  priority?: FeaturePriority
}

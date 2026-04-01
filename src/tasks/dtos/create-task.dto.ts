import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  featureId: string

  @IsString()
  @IsString()
  title: string

  @IsOptional()
  @IsDateString()
  dueDate?: string
}

import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common'
import { FeaturesService } from './features.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateFeatureDto } from './dtos/create-feature.dto'
import { AuthUser } from 'src/auth/decorators/auth-user.decorator'
import { HttpResponse, User } from 'src/utils/types'
import { QueryFeaturesDto } from './dtos/query-features.dto'
import { UpdateFeaturePriorityDto } from './dtos/update-priority.dto'

@Controller('features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Post('create')
  @Auth()
  async httpCreateFeature(@Body() data: CreateFeatureDto, @AuthUser() user: User): HttpResponse {
    const feature = await this.featuresService.create(data, user)
    return { success: true, data: { feature } }
  }

  @Get('list')
  @Auth()
  async httpListFeatures(@Query() query: QueryFeaturesDto, @AuthUser() user: User): HttpResponse {
    const result = await this.featuresService.list(query, user)
    return { success: true, data: result }
  }

  @Patch('priority')
  @Auth()
  async httpUpdatePriority(@Query() query: UpdateFeaturePriorityDto, @AuthUser() user: User): HttpResponse {
    await this.featuresService.priority(query, user)
    return { success: true }
  }
}

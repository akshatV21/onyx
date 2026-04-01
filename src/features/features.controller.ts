import { Body, Controller, Post } from '@nestjs/common'
import { FeaturesService } from './features.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateFeatureDto } from './dtos/create-feature.dto'
import { AuthUser } from 'src/auth/decorators/auth-user.decorator'
import { HttpResponse, User } from 'src/utils/types'

@Controller('features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Post('create')
  @Auth()
  async httpCreateFeature(@Body() data: CreateFeatureDto, @AuthUser() user: User): HttpResponse {
    const feature = await this.featuresService.create(data, user)
    return { success: true, data: { feature } }
  }
}

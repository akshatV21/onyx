import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { JwtModule } from '@nestjs/jwt'
import { ProjectsModule } from './projects/projects.module';
import { FeaturesModule } from './features/features.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, JwtModule.register({ global: true }), AuthModule, ProjectsModule, FeaturesModule, TasksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { SeedService } from './modules/prisma/seed/seed.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api/v2')
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  const seedService = app.get(SeedService)
  await seedService.onModuleInit()

  await app.listen(process.env.PORT)
}
bootstrap()

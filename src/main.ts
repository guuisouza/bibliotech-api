import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { SeedService } from './modules/prisma/seed/seed.service'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api/v2')
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  const seedService = app.get(SeedService)
  await seedService.onModuleInit()

  const config = new DocumentBuilder()
    .setTitle('Bibliotech API')
    .setDescription(
      'API documentation for University Library Management System'
    )
    .setVersion('2.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('docs', app, document)

  await app.listen(process.env.PORT)
}
bootstrap()

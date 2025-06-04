import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { SeedService } from './modules/prisma/seed/seed.service'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { writeFileSync } from 'fs'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  const corsConfig = {
    origin: (configService.get<string>('CORS_ORIGIN') || '').split(','),
    methods: (configService.get<string>('CORS_METHODS') || '').split(','),
    allowedHeaders: (
      configService.get<string>('CORS_ALLOWED_HEADERS') || ''
    ).split(','),
    exposedHeaders: (
      configService.get<string>('CORS_EXPOSED_HEADERS') || ''
    ).split(','),
    credentials: configService.get<boolean>('CORS_CREDENTIALS'),
    maxAge: configService.get<number>('CORS_MAX_AGE')
  }
  app.enableCors(corsConfig)

  app.setGlobalPrefix('api/v2')
  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  const seedService = app.get(SeedService)
  await seedService.onModuleInit()

  const config = new DocumentBuilder()
    .setTitle('Bibliotech API')
    .setDescription(
      'API documentation for University Library Management System'
    )
    .setVersion('3.0')
    .addBearerAuth()
    .setContact(
      'Guilherme Dilio de Souza',
      'https://github.com/guuisouza/bibliotech-api',
      'guilhermedilio2003@gmail.com'
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)

  writeFileSync(
    join(process.cwd(), 'swagger.json'),
    JSON.stringify(document, null, 2),
    { encoding: 'utf8' }
  )

  SwaggerModule.setup('docs', app, document)

  const apiPort = configService.get<string>('PORT') || '3000'
  await app.listen(apiPort)
}
bootstrap()
